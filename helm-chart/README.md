# iris helm chart
A Helm chart for deploying the iris service

### Requirements:
1. A NATS service to connect to

### Usage:

Begin by filling in values.yaml:
```yaml
nats:
  NATS_URL: "nats://nats-server:4222"
  NATS_USERNAME: "username"
  NATS_PASSWORD: "password"
  NATS_TLS: "false"
  NATS_SUBJECT: "org.from.to.>"
```
