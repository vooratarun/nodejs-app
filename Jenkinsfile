pipeline {
  agent {
    kubernetes {
      yaml """
apiVersion: v1
kind: Pod
spec:
  serviceAccountName: jenkins
  containers:
    - name: node
      image: node:18
      command: ["cat"]
      tty: true
"""
    }
  }

  stages {
    stage('Hello') {
      steps {
        container('node') {
          sh '''
            echo "Hello from Jenkins Kubernetes agent"
            node -v
            npm -v
          '''
        }
      }
    }
  }
}
