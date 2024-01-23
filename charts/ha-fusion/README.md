# Helm Chart for ha-fusion

This Helm chart simplifies the deployment of ha-fusion on Kubernetes using Helm.

## What is Helm?

[Helm](https://helm.sh/) is a package manager for Kubernetes applications. It allows you to define, install, and upgrade even the most complex Kubernetes applications.

With Helm, you can:

- **Define:** Package your Kubernetes manifests into charts to define your application structure.
- **Install:** Deploy your applications consistently across various Kubernetes clusters.
- **Upgrade/Downgrade:** Seamlessly upgrade or downgrade your application versions.
- **Rollback:** Quickly rollback to a previous release in case of issues.

## Kubernetes and Helm Installation

### Prerequisites

Before you begin, ensure you have the following installed:

- **Kubernetes Cluster:** Set up a working Kubernetes cluster. [official k3s installation guide](https://docs.k3s.io/quick-start)
- **Helm:** Install Helm on your local machine. You can follow the [official Helm installation guide](https://helm.sh/docs/intro/install/) for instructions.

### Deploy Helm Repository

1. **Clone the Repository**: Clone the ha-fusion repository to your local machine.

   ```bash
   git clone https://github.com/matt8707/ha-fusion.git
   ```

2. **Navigate to the Charts Directory**: Change to the charts directory.

   ```bash
   cd ha-fusion/charts
   ```

4. **Deploy the Chart**: Run the following command to deploy ha-fusion to your Kubernetes cluster.

   ```bash
   helm install ha-fusion .
   ```

### Configuration

For custom configuration options, refer to the [values.yaml](./values.yaml) file.

| Parameter                     | Description                                     | Default Value                     | Required |
| ----------------------------- | ----------------------------------------------- | --------------------------------- | -------- |
| `replicaCount`                | Number of replicas for the deployment           | `1`                               | `false`  |
| `image.repository`            | Docker image repository                         | `ghcr.io/matt8707/ha-fusion`     | `false`  |
| `image.tag`                   | Docker image tag                                | `"latest"`                        | `false`  |
| `image.pullPolicy`            | Docker image pull policy                        | `IfNotPresent`                    | `false`  |
| `image.imagepullsecret`       | Docker image pull secret, if any                | `[]`                              | `false`  |
| `service.type`                | Service type                                    | `ClusterIP`                       | `false`  |
| `service.port`                | Service port                                    | `5050`                            | `false`  |
| `service.targetPort`          | Target port inside the pod                      | `5050`                            | `false`  |
| `service.protocol`            | Protocol used by the service                   | `TCP`                             | `false`  |
| `service.name`                | Name of the service                             | `http`                            | `false`  |
| `ingress.enabled`             | Whether ingress is enabled or not               | `true`                            | `false`  |
| `ingress.ingressClassName`    | Ingress class name                              |                                    | `true`  |
| `ingress.annotations`         | Annotations for the ingress                     | `{}`                              | `false`  |
| `ingress.path`                | Path for the ingress                            | `/`                               | `false`  |
| `ingress.hosts`               | Hosts that the ingress should match             |                                   | `true`  |
| `ingress.tls.enabled`         | Whether TLS is enabled or not                   | `true`                            | `false`  |
| `ingress.tls.secretName`      | Secret name for the TLS certificate             |                                    | `true`  |
| `pvcName`                     | Persistent Volume Claim name                    | `ha-fusion`                       | `false`  |
| `storageClassName`            | Storage class name for the PVC                  |                                  | `true`  |
| `storageSize`                 | Size of the storage for the PVC                  | `1Gi`                             | `false`  |
| `env.TZ`                      | Timezone for the container                      |                                   | `true`  |
| `env.HASS_URL`                | URL for the Home Assistant server               |                                    | `true`  |
| `serviceAccount.create`       | Whether to create a service account or not      | `false`                           | `false`  |
| `livenessProbe.path`          | Path for the liveness probe                     | `/`                               | `false`  |
| `livenessProbe.port`          | Port for the liveness probe                     | `http`                            | `false`  |
| `readinessProbe.path`         | Path for the readiness probe                    | `/`                               | `false`  |
| `readinessProbe.port`         | Port for the readiness probe                    | `http`                            | `false`  |
| `nodeSelector`                | Node selector for the pod scheduling            | `{}`                              | `false`  |
| `tolerations`                 | Tolerations for the pod scheduling              | `[]`                              | `false`  |

### Contributing

Feel free to contribute to the development of this Helm chart by opening issues or submitting pull requests!