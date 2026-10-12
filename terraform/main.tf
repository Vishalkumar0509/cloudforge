terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }
}

provider "aws" {
  region = "ap-south-2"
}

resource "aws_vpc" "cloudforge" {
  cidr_block = "172.31.0.0/16"

  lifecycle {
    prevent_destroy = true
  }
}

resource "aws_subnet" "cloudforge_2a" {
  vpc_id                  = aws_vpc.cloudforge.id
  cidr_block              = "172.31.0.0/20"
  availability_zone       = "ap-south-2a"
  map_public_ip_on_launch = true

  lifecycle {
    prevent_destroy = true
  }
}

resource "aws_subnet" "cloudforge_2c" {
  vpc_id                  = aws_vpc.cloudforge.id
  cidr_block              = "172.31.16.0/20"
  availability_zone       = "ap-south-2c"
  map_public_ip_on_launch = true

  lifecycle {
    prevent_destroy = true
  }
}

resource "aws_subnet" "cloudforge_2b" {
  vpc_id                  = aws_vpc.cloudforge.id
  cidr_block              = "172.31.32.0/20"
  availability_zone       = "ap-south-2b"
  map_public_ip_on_launch = true

  lifecycle {
    prevent_destroy = true
  }
}

resource "aws_security_group" "cloudforge_alb" {
  name        = "cloudforge-alb-sg"
  description = "Security group for CloudForge Application Load Balancer"
  vpc_id      = aws_vpc.cloudforge.id

  lifecycle {
    prevent_destroy = true
  }
}

resource "aws_security_group" "cloudforge_frontend" {
  name        = "cloudforge-frontend-sg"
  description = "CloudForge frontend ECS security group"
  vpc_id      = aws_vpc.cloudforge.id

  lifecycle {
    prevent_destroy = true
  }
}

resource "aws_security_group" "cloudforge_backend" {
  name        = "cloudforge-backend-sg"
  description = "Security group for CloudForge backend ECS tasks"
  vpc_id      = aws_vpc.cloudforge.id

  lifecycle {
    prevent_destroy = true
  }
}

resource "aws_security_group" "cloudforge_rds" {
  name        = "cloudforge-rds-sg"
  description = "Security group for CloudForge PostgreSQL RDS"
  vpc_id      = aws_vpc.cloudforge.id

  lifecycle {
    prevent_destroy = true
  }
}


resource "aws_db_instance" "cloudforge_postgres" {
  username                     = "cloudforge"
  port                         = 5432
  parameter_group_name         = "default.postgres18"
  auto_minor_version_upgrade   = true
  storage_encrypted            = true
  performance_insights_enabled = false
  monitoring_interval          = 0
  identifier                   = "cloudforge-postgres"
  engine                       = "postgres"
  engine_version               = "18.3"
  instance_class               = "db.t4g.micro"
  allocated_storage            = 20
  storage_type                 = "gp3"

  multi_az                = false
  publicly_accessible     = false
  db_subnet_group_name    = "cloudforge-db-subnet-group"
  vpc_security_group_ids  = ["sg-06541e7e96164629f"]
  backup_retention_period = 1

  deletion_protection = false
  skip_final_snapshot = true

  tags = {
    Environment = "dev"
    Project     = "CloudForge"
  }

  lifecycle {
    prevent_destroy = true
  }
}


resource "aws_lb" "cloudforge" {
  name               = "cloudforge-alb"
  internal           = false
  load_balancer_type = "application"
  ip_address_type    = "ipv4"

  security_groups = ["sg-0ccfddcf44874c1d4"]

  subnets = [
    "subnet-075288d7019e9e58b",
    "subnet-0bb0a04103a0f7419"
  ]

  enable_deletion_protection = false
  idle_timeout               = 60
  enable_http2               = true

  lifecycle {
    prevent_destroy = true
  }
}


resource "aws_lb_target_group" "cloudforge_frontend" {
  name        = "cloudforge-frontend-tg"
  port        = 3000
  protocol    = "HTTP"
  target_type = "ip"
  vpc_id      = aws_vpc.cloudforge.id

  health_check {
    enabled             = true
    protocol            = "HTTP"
    path                = "/"
    port                = "traffic-port"
    matcher             = "200"
    interval            = 30
    timeout             = 5
    healthy_threshold   = 5
    unhealthy_threshold = 2
  }

  lifecycle {
    prevent_destroy = true
  }
}

resource "aws_lb_target_group" "cloudforge_backend" {
  name        = "cloudforge-backend-tg"
  port        = 8000
  protocol    = "HTTP"
  target_type = "ip"
  vpc_id      = aws_vpc.cloudforge.id

  health_check {
    enabled             = true
    protocol            = "HTTP"
    path                = "/api/notes/"
    port                = "traffic-port"
    matcher             = "200"
    interval            = 30
    timeout             = 5
    healthy_threshold   = 5
    unhealthy_threshold = 2
  }

  lifecycle {
    prevent_destroy = true
  }
}

data "aws_caller_identity" "current" {}

output "aws_account_id" {
  value = data.aws_caller_identity.current.account_id
}

resource "aws_lb_listener" "cloudforge_http" {
  load_balancer_arn = aws_lb.cloudforge.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.cloudforge_frontend.arn

    forward {
      target_group {
        arn    = aws_lb_target_group.cloudforge_frontend.arn
        weight = 1
      }
    }
  }

  lifecycle {
    prevent_destroy = true
  }
}

resource "aws_lb_listener_rule" "cloudforge_api" {
  listener_arn = aws_lb_listener.cloudforge_http.arn
  priority     = 20

  action {
    type = "forward"

    forward {
      target_group {
        arn    = aws_lb_target_group.cloudforge_backend.arn
        weight = 1
      }
    }
  }

  condition {
    path_pattern {
      values = ["/api/*"]
    }
  }

  lifecycle {
    prevent_destroy = true
  }
}

resource "aws_ecs_cluster" "cloudforge" {
  name = "cloudforge-cluster"

  lifecycle {
    prevent_destroy = true
  }
}

resource "aws_ecs_service" "cloudforge_backend" {
  name            = "cloudforge-backend"
  cluster         = aws_ecs_cluster.cloudforge.id
  task_definition = "cloudforge-backend:5"
  desired_count   = 1
  launch_type     = "FARGATE"

  deployment_minimum_healthy_percent = 100
  deployment_maximum_percent         = 200

  network_configuration {
    subnets          = ["subnet-075288d7019e9e58b"]
    security_groups  = ["sg-033d8e8222b60104a"]
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.cloudforge_backend.arn
    container_name   = "cloudforge-backend"
    container_port   = 8000
  }

  lifecycle {
    prevent_destroy = true
  }
}

resource "aws_ecs_service" "cloudforge_frontend" {
  name            = "cloudforge-frontend"
  cluster         = aws_ecs_cluster.cloudforge.id
  task_definition = "cloudforge-frontend:1"
  desired_count   = 1
  launch_type     = "FARGATE"

  deployment_minimum_healthy_percent = 100
  deployment_maximum_percent         = 200

  network_configuration {
    subnets = [
      "subnet-075288d7019e9e58b",
      "subnet-0bb0a04103a0f7419",
      "subnet-066f9dbfbc853b5a7"
    ]

    security_groups  = ["sg-0be2450104b405c64"]
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.cloudforge_frontend.arn
    container_name   = "cloudforge-frontend"
    container_port   = 3000
  }

  lifecycle {
    prevent_destroy = true
  }
}

resource "aws_ecr_repository" "cloudforge_backend" {
  name                 = "cloudforge-backend"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  encryption_configuration {
    encryption_type = "AES256"
  }

  lifecycle {
    prevent_destroy = true
  }
}

resource "aws_ecr_repository" "cloudforge_frontend" {
  name                 = "cloudforge-frontend"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  encryption_configuration {
    encryption_type = "AES256"
  }

  lifecycle {
    prevent_destroy = true
  }
}
