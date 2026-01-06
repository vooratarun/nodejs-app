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
      image: gcr.io/kaniko-project/executor:latest
      args:
        - --dockerfile=Dockerfile
        - --context=.
        - --destination=745392035468.dkr.ecr.ap-south-1.amazonaws.com/nodejs-app:${BUILD_NUMBER}
        - --cache=true
        - --cache-dir=/cache
      volumeMounts:
        - name: kaniko-cache
          mountPath: /cache

    - name: kubectl
      image: bitnami/kubectl:latest
      command: ["cat"]
      tty: true

  volumes:
    - name: kaniko-cache
      emptyDir: {}
"""
    }
  }

  stages {

    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Build & Push Image (Kaniko)') {
      steps {
        echo "Kaniko container already built & pushed the image"
      }
    }

    stage('Deploy to EKS') {
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
}
