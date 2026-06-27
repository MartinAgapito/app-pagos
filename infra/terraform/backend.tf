terraform {
  required_version = ">= 1.6.0"

  backend "s3" {
    bucket         = "app-pagos-tfstate-463310123916"
    key            = "app-pagos/production/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "app-pagos-terraform-locks"
    encrypt        = true
  }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}
