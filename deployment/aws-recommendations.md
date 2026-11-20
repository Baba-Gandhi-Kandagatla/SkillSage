# AWS Deployment Recommendations for SkillSage

## EC2 Instance Configuration

### Initial Setup (Development/Testing)
- **Instance Type**: t3.medium (2 vCPU, 4 GB RAM)
- **Storage**: 20 GB gp3 SSD
- **Operating System**: Amazon Linux 2023 or Ubuntu 22.04 LTS
- **Network**: VPC with public subnet for initial deployment

### Production (Low to Medium Traffic)
- **Instance Type**: t3.large (2 vCPU, 8 GB RAM) or r6i.large (2 vCPU, 16 GB RAM) if memory usage is high
- **Storage**: 40 GB gp3 SSD with 3000 IOPS baseline
- **Auto Scaling**: Minimum 2 instances across different availability zones
- **Load Balancer**: Application Load Balancer (ALB)

### Scaling for Higher Traffic
- **Instance Type**: c6i.xlarge (4 vCPU, 8 GB RAM) for compute-heavy workloads or r6i.xlarge (4 vCPU, 32 GB RAM) for memory-intensive operations
- **Auto Scaling**: Configure based on CPU utilization (target around 70%)
- **Auto Scaling Group**: 2-10 instances depending on traffic patterns

## Database Configuration

Since your application uses PostgreSQL:

- **Initial Setup**: Amazon RDS PostgreSQL t3.medium instance
- **Production**: Amazon RDS PostgreSQL r6g.large with Multi-AZ for high availability
- **Storage**: Start with 100 GB gp3 with provisioned IOPS for production

## Container-Based Deployment (Recommended)

Since your application already has a Dockerfile, consider:

1. **Amazon ECR** for storing Docker images
2. **Amazon ECS** with Fargate for serverless container management
   - Task definition: 1 vCPU, 2 GB memory (development)
   - Task definition: 2 vCPU, 4 GB memory (production)
3. **Amazon EKS** if you need more complex orchestration in the future

## Environment Variables & Secrets Management

- Use **AWS Systems Manager Parameter Store** for environment variables
- Use **AWS Secrets Manager** for sensitive credentials (especially your OpenAI API keys)

## Scaling Strategy

1. **Horizontal Scaling**: Configure Auto Scaling Groups based on CPU utilization and request count
2. **Vertical Scaling**: Monitor memory and CPU usage to determine if larger instance types are needed
3. **Database Scaling**: Use RDS read replicas for read-heavy workloads

## Cost Optimization

- Consider using EC2 Spot Instances for non-critical workloads
- Use Reserved Instances for predictable baseline capacity (1 or 3 year commitment)
- Implement automatic shutdown for development/staging environments during off-hours
