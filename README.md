# cloud

Pulumi project to deploy DynamoDB table and lambdas that read and write to it.

To deploy this project on AWS, you need to [install Pulumi](https://www.pulumi.com/docs/install/) first.
Then in your shell terminal export AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY.
```bash
export AWS_ACCESS_KEY_ID="ABI2QIK3PCZMTHEBRBTC"
export AWS_SECRET_ACCESS_KEY="7qr5NZbFhYTQvBDEbvZUnOfgH+jpackKNmTURR3e"
```
After doing that, change to this directory and run:
```bash
pulumi up -y
```
You will see in the output this:
```bash
Outputs:
    url: "https://j640wjb4yc.execute-api.us-east-1.amazonaws.com/stage/"
```
Use this url to send requests like:
```bash
curl -XGET https://j640wjb4yc.execute-api.us-east-1.amazonaws.com/stage/users
curl -XPOST https://j640wjb4yc.execute-api.us-east-1.amazonaws.com/stage/users -d'{"name": "my-name", "user_id": "my-id", "age": 25}'
```

After you're done, do not forget to remove everything by executing the following command:
```bash
pulumi destroy -y
```
