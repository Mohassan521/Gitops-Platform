terraform {
    required_version = ">= 1.8.0"

    required_providers {
        hcloud = {
            source  = "hetznercloud/hcloud"
            version = "~> 1.50"
        }
    }
}

provider "hcloud" {
  token = var.hcloud_token
}

resource "hcloud_server" "existing_vm" {
  name        = "ubuntu-4gb-hel1-1"
  server_type = "cx23"
  image       = "ubuntu-26.04"
}