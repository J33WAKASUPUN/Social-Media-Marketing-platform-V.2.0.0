terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
  }

  backend "azurerm" {
    resource_group_name  = "tfstate-rg"
    storage_account_name = "supuntfstate123"
    container_name       = "tfstate"
    key                  = "backend.terraform.tfstate"
  }
}

provider "azurerm" {
  # ✅ Fixes the "HTTP response was nil" / registration error
  skip_provider_registration = true

  features {
    resource_group {
      prevent_deletion_if_contains_resources = false
    }
  }
}