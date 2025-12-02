resource "random_string" "suffix" {
  length  = 6
  special = false
  upper   = false
}

locals {
  app_name = "socialflow-${random_string.suffix.result}"
  location = "southeastasia" # ✅ Closest region to Sri Lanka
}

resource "azurerm_resource_group" "rg" {
  name     = "${local.app_name}-rg"
  location = local.location
}

# 1. Container Registry
resource "azurerm_container_registry" "acr" {
  name                = "acr${random_string.suffix.result}"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  sku                 = "Basic"
  admin_enabled       = true
}

# 2. Cosmos DB (MongoDB)
resource "azurerm_cosmosdb_account" "db" {
  name                = "${local.app_name}-db"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  offer_type          = "Standard"
  kind                = "MongoDB"
  
  free_tier_enabled = true

  capabilities {
    name = "EnableMongo"
  }

  consistency_policy {
    consistency_level = "Session"
  }

  geo_location {
    location          = azurerm_resource_group.rg.location
    failover_priority = 0
  }
}

# 3. Redis Cache
resource "azurerm_redis_cache" "redis" {
  name                = "${local.app_name}-redis"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  capacity            = 0
  family              = "C"
  sku_name            = "Basic"
  
  non_ssl_port_enabled = false # Forces SSL (Port 6380)
  minimum_tls_version  = "1.2"
}

# 4. App Service Plan
resource "azurerm_service_plan" "asp" {
  name                = "${local.app_name}-plan"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  os_type             = "Linux"
  sku_name            = "B1"
}

# 5. Web App (Backend)
resource "azurerm_linux_web_app" "backend_app" {
  name                = "${local.app_name}-api"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_service_plan.asp.location
  service_plan_id     = azurerm_service_plan.asp.id

  site_config {
    always_on = false
    application_stack {
      docker_image_name   = "nginx:latest"
      docker_registry_url = "https://index.docker.io"
    }
  }

  # ✅ MAPPED TO YOUR .ENV FILE
  app_settings = {
    # System Config
    "NODE_ENV"      = "production"
    "APP_NAME"      = "Social Media Marketing Platform"
    "APP_PORT"      = "5000"
    "PORT"          = "5000"
    "WEBSITES_PORT" = "5000" # Important for Azure routing
    
    # URL Configuration
    "APP_URL"       = "https://${local.app_name}-api.azurewebsites.net"
    "CLIENT_URL"    = "http://localhost:5173" # Update this once Frontend is deployed!
    "CORS_ORIGIN"   = "http://localhost:5173,https://${local.app_name}-api.azurewebsites.net"

    # Database (Auto-Connected)
    "MONGODB_URI"     = azurerm_cosmosdb_account.db.primary_mongodb_connection_string
    "MONGODB_DB_NAME" = "social_media_platform"

    # Redis (Auto-Connected)
    "REDIS_HOST"       = azurerm_redis_cache.redis.hostname
    "REDIS_PORT"       = "6380" # SSL Port
    "REDIS_PASSWORD"   = azurerm_redis_cache.redis.primary_access_key
    "REDIS_DB_CACHE"   = "0"
    "REDIS_DB_SESSION" = "1"
    "REDIS_DB_QUEUE"   = "2"
    # Provide URL format for libraries that prefer it
    "REDIS_URL"        = "rediss://:${azurerm_redis_cache.redis.primary_access_key}@${azurerm_redis_cache.redis.hostname}:6380"

    # Application Settings
    "UPLOAD_DIR"                   = "uploads"
    "MAX_FILE_SIZE"                = "10485760"
    "SOCIAL_PROVIDER_MODE"         = "mixed"
    "ENABLE_SOCIAL_POSTING"        = "true"
    "ENABLE_ANALYTICS_COLLECTION"  = "true"
    "RATE_LIMIT_ENABLED"           = "true"

    # ⚠️ SECRETS PLACEHOLDERS (Update these in Azure Portal)
    "JWT_SECRET"                = "update_me_in_portal"
    "JWT_REFRESH_SECRET"        = "update_me_in_portal"
    "SESSION_SECRET"            = "update_me_in_portal"
    "ENCRYPTION_KEY"            = "update_me_in_portal"
    
    # Cloudinary & AWS & Mail
    "CLOUDINARY_URL"            = "update_me_in_portal"
    "AWS_ACCESS_KEY_ID"         = "update_me_in_portal"
    "AWS_SECRET_ACCESS_KEY"     = "update_me_in_portal"
    "AWS_S3_BUCKET_NAME"        = "update_me_in_portal"
    "AWS_REGION"                = "us-east-2"
    "MAIL_USER"                 = "update_me_in_portal"
    "MAIL_PASSWORD"             = "update_me_in_portal"
    
    # OAuth Keys (Google, FB, etc)
    "GOOGLE_AUTH_CLIENT_ID"     = "update_me_in_portal"
    "GOOGLE_AUTH_CLIENT_SECRET" = "update_me_in_portal"
    "LINKEDIN_CLIENT_ID"        = "update_me_in_portal"
    "LINKEDIN_CLIENT_SECRET"    = "update_me_in_portal"
    # ... Add other social keys in Portal
  }

  identity {
    type = "SystemAssigned"
  }
}

# 6. Grant Access
resource "azurerm_role_assignment" "acr_pull" {
  scope                = azurerm_container_registry.acr.id
  role_definition_name = "AcrPull"
  principal_id         = azurerm_linux_web_app.backend_app.identity[0].principal_id
}