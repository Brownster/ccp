provider "aws" {
  region = "us-west-2"
}

resource "aws_instance" "web_server" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t2.micro"
  
  tags = {
    Name = "WebServer"
    Environment = "Test"
  }
}

resource "aws_s3_bucket" "storage" {
  bucket = "example-terraform-bucket"
  
  tags = {
    Name = "StorageBucket"
    Environment = "Test"
  }
}