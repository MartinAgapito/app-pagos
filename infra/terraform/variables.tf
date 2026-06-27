variable "aws_region" {
  type    = string
  default = "us-east-1"
}

variable "project_name" {
  type    = string
  default = "app-pagos"
}

variable "environment" {
  type    = string
  default = "production"
}

variable "cloudfront_price_class" {
  type    = string
  default = "PriceClass_100"
}

variable "enable_s3_versioning" {
  type    = bool
  default = true
}
