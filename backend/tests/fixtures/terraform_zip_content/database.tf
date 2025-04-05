resource "aws_dynamodb_table" "data_store" {
  name           = "data-table"
  billing_mode   = "PROVISIONED"
  read_capacity  = 20
  write_capacity = 10
  hash_key       = "id"
  
  attribute {
    name = "id"
    type = "S"
  }
  
  tags = {
    Name = "DataStore"
    Environment = "Test"
  }
}