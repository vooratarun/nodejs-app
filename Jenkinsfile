pipeline {
  agent {
    kubernetes {
      defaultContainer 'kubectl'
      yaml """
apiVersion: v1
kind: Pod
spec:
  serviceAccountName: jenkins
  containers:
  - name: kubectl
    image: alpine/kubectl:1.35.0
    command: ["sh", "-c", "cat"]
    tty: true

  - name: kaniko
    image: gcr.io/kaniko-project/executor:debug
    command: ["sh", "-c", "cat"]
    tty: true
"""
    }
  }

  triggers {
    githubPush()
  }

  environment {
    AWS_REGION     = "ap-south-1"
    AWS_ACCOUNT_ID = "745392035468"
    ECR_REPO       = "nodejs-app"
    IMAGE_TAG      = "${BUILD_NUMBER}"
    IMAGE_URI      = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO}:${IMAGE_TAG}"
  }

  stages {

    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Build & Push Image') {
      steps {
        container('kaniko') {
          sh '''
            set -e

            mkdir -p /kaniko/.docker

            cat <<EOF > /kaniko/.docker/config.json
            {
              "credHelpers": {
                "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com": "ecr-login"
              }
            }
EOF

            /kaniko/executor \
              --dockerfile Dockerfile \
              --context $(pwd) \
              --destination ${IMAGE_URI} \
              --cache=true
          '''
        }
      }
    }

    stage('Deploy to EKS') {
      steps {
        container('kubectl') {
          sh '''
            set -e

            kubectl get nodes

            cp k8s/deployment.yaml /tmp/deployment.yaml
            sed -i "s|IMAGE_PLACEHOLDER|${IMAGE_URI}|g" /tmp/deployment.yaml

            kubectl apply -f /tmp/deployment.yaml
            kubectl apply -f k8s/service.yaml
          '''
        }
      }
    }
  }
}
