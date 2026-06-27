# Infraestructura — App Pagos

Arquitectura: `Usuario → CloudFront → OAC → S3 privado`
Deploy: `GitHub Actions → aws s3 sync + invalidación CloudFront`

URL del sitio: `https://d1qsceqp1u9zjs.cloudfront.net`

## Comandos de Terraform

```bash
cd infra/terraform

terraform plan      # ver cambios pendientes
terraform apply     # aplicar cambios
terraform output    # ver outputs
terraform output -raw deploy_user_secret_access_key  # ver secret key
terraform destroy   # eliminar toda la infraestructura
```

## Troubleshooting

| Error | Solución |
|---|---|
| CloudFront 403 después del deploy | Esperar 1-2 min para que se propague la invalidación |
| GitHub Actions falla en `aws s3 sync` | Verificar que los 6 GitHub Secrets estén configurados |
| `Backend configuration changed` | Ejecutar `terraform init -reconfigure` |
