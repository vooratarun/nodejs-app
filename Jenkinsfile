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
      image: bitnami/kubectl:latest
      command: ["cat"]
      tty: true

    - name: kaniko
      image: gcr.io/kaniko-project/executor:debug
      command: ["sh", "-c", "sleep infinity"]
"""
    }
  }

  environment {
    AWS_REGION = "ap-south-1"
    AWS_ACCOUNT_ID = "745392035468"
    ECR_REPO = "nodejs-app"
    IMAGE_TAG = "${BUILD_NUMBER}"
    IMAGE_URI = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO}:${IMAGE_TAG}"
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
        sh '''
          kubectl get nodes
          sed -i "s|IMAGE_PLACEHOLDER|${IMAGE_URI}|g" k8s/deployment.yaml
          kubectl apply -f k8s/deployment.yaml
          kubectl apply -f k8s/service.yaml
          kubectl rollout status deployment/nodejs-app --timeout=60s
        '''
      }
    }
  }
}
