output "website_url" {
  value = "https://${aws_cloudfront_distribution.website.domain_name}"
}

output "cloudfront_domain_name" {
  value = aws_cloudfront_distribution.website.domain_name
}

output "cloudfront_distribution_id" {
  value = aws_cloudfront_distribution.website.id
}

output "s3_bucket_name" {
  value = aws_s3_bucket.website.bucket
}

output "aws_region" {
  value = var.aws_region
}

output "deploy_user_access_key_id" {
  value = aws_iam_access_key.deploy.id
}

output "deploy_user_secret_access_key" {
  value     = aws_iam_access_key.deploy.secret
  sensitive = true
}

output "s3_bucket_arn" {
  value = aws_s3_bucket.website.arn
}

output "aws_account_id" {
  value = data.aws_caller_identity.current.account_id
}

output "api_url" {
  value       = aws_apigatewayv2_stage.api.invoke_url
  description = "URL base de la API — usar como VITE_API_URL"
}

output "dynamodb_table_name" {
  value = aws_dynamodb_table.data.name
}
