pipeline {
  agent {
    kubernetes {
      yaml """
apiVersion: v1
kind: Pod
spec:
  serviceAccountName: jenkins

  containers:
    - name: kaniko
      image: gcr.io/kaniko-project/executor:debug
      command: ["sh", "-c", "sleep infinity"]

    - name: kubectl
      image: bitnami/kubectl:latest
      command: ["cat"]
      tty: true
"""
    }
  }

  environment {
    AWS_REGION    = "ap-south-1"
    AWS_ACCOUNT_ID = "745392035468"
    ECR_REPO      = "nodejs-app"
    IMAGE_TAG     = "${BUILD_NUMBER}"
    IMAGE_URI     = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO}:${IMAGE_TAG}"
  }

  stages {

    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Build & Push Image (Kaniko)') {
      steps {
        container('kaniko') {
          sh '''
            echo "Building image: ${IMAGE_URI}"

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
        set -x

        kubectl version --client
        kubectl get nodes

        kubectl apply -f k8s/deployment.yaml
        kubectl apply -f k8s/service.yaml

        echo "Deploy commands executed"
      '''
    }
  }
}

  }

  post {
    success {
      echo "✅ Build & Deployment successful"
    }
    failure {
      echo "❌ Pipeline failed"
    }
  }
}
