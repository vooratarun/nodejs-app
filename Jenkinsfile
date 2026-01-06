pipeline {

  agent {
    kubernetes {
      yaml """
apiVersion: v1
kind: Pod
spec:
  containers:
  - name: node
    image: node:18-alpine
    command: ['cat']
    tty: true

  - name: docker
    image: docker:24
    command: ['cat']
    tty: true
    securityContext:
      privileged: true
    volumeMounts:
    - name: docker-sock
      mountPath: /var/run/docker.sock

  - name: aws
    image: amazon/aws-cli:2
    command: ['cat']
    tty: true

  - name: kubectl
    image: bitnami/kubectl:latest
    command: ['cat']
    tty: true

  volumes:
  - name: docker-sock
    hostPath:
      path: /var/run/docker.sock
"""
    }
  }

  environment {
    AWS_REGION     = "ap-south-1"
    ECR_ACCOUNT_ID = "745392035468"
    ECR_REPO       = "nodejs-app"
    IMAGE_TAG      = "${BUILD_NUMBER}"
    AWS_CREDS      = "aws-creds"
  }

  stages {

    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Install Dependencies') {
      steps {
        container('node') {
          sh 'npm install'
        }
      }
    }

    stage('Build Docker Image') {
      steps {
        container('docker') {
          sh 'docker build -t ${ECR_REPO}:${IMAGE_TAG} .'
        }
      }
    }

    stage('Login to ECR') {
      steps {
        container('aws') {
          withCredentials([[
            $class: 'AmazonWebServicesCredentialsBinding',
            credentialsId: AWS_CREDS
          ]]) {
            sh '''
              aws ecr get-login-password --region ${AWS_REGION} \
              | docker login --username AWS \
              --password-stdin ${ECR_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com
            '''
          }
        }
      }
    }

    stage('Push Image to ECR') {
      steps {
        container('docker') {
          sh '''
            docker tag ${ECR_REPO}:${IMAGE_TAG} \
              ${ECR_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO}:${IMAGE_TAG}

            docker push \
              ${ECR_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO}:${IMAGE_TAG}
          '''
        }
      }
    }

    stage('Update K8s Deployment Image') {
      steps {
        container('node') {
          sh '''
            sed -i "s|IMAGE_PLACEHOLDER|${ECR_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO}:${IMAGE_TAG}|g" k8s/deployment.yaml
          '''
        }
      }
    }

    stage('Deploy to Kubernetes') {
      steps {
        container('kubectl') {
          sh '''
            kubectl apply -f k8s/deployment.yaml
            kubectl apply -f k8s/service.yaml
          '''
        }
      }
    }
  }

  post {
    success {
      echo "✅ Deployment successful"
    }
    failure {
      echo "❌ Deployment failed"
    }
  }
}
