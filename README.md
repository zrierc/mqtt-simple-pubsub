# MQTT — Simple Pub/Sub using Lambda

#### Tables of Contents:

- [Overview](#overview)
- [Project Structure](#project-structure)
- [Requirements](#requirements)
- [Setup Environment](#setup-environment)
  - [Infrastructure](#setup-infrastructure)
  - [Lambda Publisher](#setup-lambda-publisher)
  - [Web-App](#setup-web-app)
- [Testing](#🧪-testing)
- [Improving Your Web-App](#improving-your-web-app)
  - [Improve Security & Best Practices](#improve-security)
  - [Add High-Availability](#add-high-availability)
- [Clean Up Resources](#clean-up-resources)

---

## Overview

Welcome to mini workshop about MQTT using AmazonMQ - Lambda Function - ReactJS!

In this mini workshop, you will learn both about publishing and subscribing messages using MQTT. You will also learn how to setup/deploy web-app and lambda function in AWS. Please take a look the architecture below.

<p align="center">
<img src="./architecture.png">
</p>

The content of this mini workshop may be updated and if you have questions or find issues in this mini workshop, please file them as an Issue.

## Project Structure

```md
mqtt-simple-pubsub/
├─ functions/
├─ web/
├─ .gitignore
├─ architecture.png
├─ LICENSE
├─ README.md
```

- [`functions/`](/functions/) contains lambda function code for publishing messages to MQTT.
- [`web/`](/web/) contains source code of web-app build with ReactJS. This web-app works as a subcriber and will displays the data sent by the publisher.
- [`architecture.png`](/architecture.png) is an overview of the resources to be deployed.
- [`README.md`](/README.md) contains guide for this mini workshop.

## Requirements

Before starting this mini workshop, the following runtime/tools must be met and configured properly.

- Active [AWS Account](https://aws.amazon.com/).
- [NodeJS](https://nodejs.org/en) `v16` or latest.
- [AWS CLI version 2](https://aws.amazon.com/cli/).
- (optional) OS based on Linux.
  > **Note** </br>
  > Build script for package lambda function code and it's dependecies require Linux/Unix shell to operate. If you are using an OS other than Linux and/or your device doesn't support Linux shell commands you can customize [this build script](/functions/build.sh) to make sure it runs properly.

### AWS Resources

Some of the services from AWS that are used in this mini workshop are as follows:

- [AWS Lambda](https://aws.amazon.com/lambda/)
- [Amazon VPC](https://aws.amazon.com/vpc/)
- [Amazon MQ](https://aws.amazon.com/amazon-mq/)
- [Amazon EC2](https://aws.amazon.com/ec2/)

---

## Setup Environment

### Setup Infrastructure

> **Note** </br>
> If the settings/configurations are not specified in this guide, you can leave them as default or you can specify the values with your own.

1. Select AWS region.

2. Create VPC with following specifications:

   - Has two or more subnets.
   - Has internet gateway attached/route to public subnets.
   - (optional) At least one NAT Gateways route to private subnets.
     > **💡 TIP**
     >
     > Use it when the resource(s) needed internet connection. Note that there is a charge for each NAT gateway.
   - DNS hostnames and DNS resolution must be enabled.

3. Create first security group with following rules:

   - Allow port 8162 from anywhere
   - Allow port 8883 from anywhere
   - Allow port 61619 from anywhere
   - Allow all traffic/port to anywhere

4. Create Amazon MQ broker with following spefications:

   - Broker engine: Apache Active MQ
   - Deployment mode: Single-instance broker
   - Storage type: Durability optimized
   - Broker instance type: `mq.t3.micro`
   - ActiveMQ access: Simple Authentication and Authorization
     > Fill username and password with your own. Make sure you store it somewhere else so you don't forget. Alternatively, you can store it in [AWS SSM parameter store](https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-parameter-store.html) or [AWS Secret Manager](https://docs.aws.amazon.com/secretsmanager/latest/userguide/intro.html).
   - Broker engine version: `5.17.3`
   - Access type: Public access
   - VPC and subnets: Select existing VPC and subnet(s)
     > Select VPC that you've created before.
   - Security groups: Select existing security groups
     > Select first security group that you've created before.

5. Create second security group with following rules:

   - Allow HTTP/HTTPS port from anywhere
   - (optional) Allow port 3000 from anywhere
   - (optional) Allow SSH port from your IP
   - Allow all traffic/port to anywhere

6. Create EC2 instance with following configurations:

   > For AMI, Instance Type and Storage doesn't have to be exactly the same. For example you can choose instance type that has more large or small than the recommended type.

   - OS/Amazon Machine Image (AMI): Ubuntu 22.04 LTS (Recommended)
   - Instance Type: `t4g.small` (Recommended)
   - VPC: Select VPC that you've created before.
   - Subnet: Select subnet that you've created before.
   - Auto-assign public IP: `true`
   - Security group: Select existing security group
     > Select second security group that you've created before.
   - Storage size: 10 GiB (Recommended)
   - Storage type: `gp3` (Recommended)

### Setup Lambda Publisher

> **Note** </br>
> If the settings/configurations are not specified in this guide, you can leave them as default or you can specify the values with your own.

1. Select the same AWS region as the [infrastructure](#setup-infrastructure) that has been deployed.

2. Create Lambda function with the following configurations:

   - Runtime: Node.js 18.x
   - Memory: 128 MB
   - Handler: `publisher.handler`
   - Enable VPC
     > Select VPC and subnet group that you've created before. For security group you can use default security group or you can create custom security group.

3. Configure Lambda enviroment variables:

   ```env
   MQ_HOST=<your-amazonmq-mqtt-endpoint>
   MQ_TOPIC=broadcast
   MQ_USERNAME=<your-amazonmq-username>
   MQ_PASSWORD=<your-amazonmq-password>
   ```

   example:

   ```env
   MQ_HOST="mqtt+ssl:b-123abc-45d-67ef-890123abc.mq.ap-southeast-1.amazonaws.com:8883"
   MQ_TOPIC=broadcast
   MQ_USERNAME=admin
   MQ_PASSWORD=admin1234567
   ```

4. Build and publish code

   - Clone [this repository](https://github.com/zrierc/mqtt-simple-pubsub)

     ```bash
     git clone https://github.com/zrierc/mqtt-simple-pubsub.git && cd mqtt-simple-pubsub/
     ```

   - Navigate to [`functions/`](/functions/)

     ```bash
     cd functions/
     ```

   - Install required dependencies

     ```bash
     npm i
     ```

     or

     ```bash
     yarn
     ```

   - Build your lambda function code and dependencies to zip

     ```bash
     npm run build
     ```

     or

     ```bash
     yarn build
     ```

   - Publish your zip package to lambda using AWS CLI:

     ```bash
     aws lambda update-function-code \
       --function-name <your-lambda-function-name> \
       --zip-file fileb://function.zip
     ```

5. Test invoke function with the following event:

   ```json
   {
     "message": "hello from lambda!"
   }
   ```

   > **Note** </br>
   > Feel free to change the `message` value.

#### 😕 Are you stuck?

Check this common issues:

<details>
  <summary>❌ Failed running build command</summary>

- Make sure npm or yarn already installed on your machine.
- Make sure zip and unzip already installed on your machine. Click [here](https://www.tecmint.com/install-zip-and-unzip-in-linux/) to read guide how to install zip and unzip in Linux machine.
- Make sure your machine support Linux/Unix commands to run build script. For Windows user, you can try to install [WSL 2](https://learn.microsoft.com/en-us/windows/wsl/install) to run Linux on your Windows machine OR you can create custom build script using powershell/cmd. Don't forget to change `build` script command inside `package.json`.
</details>

<details>
  <summary>⚠ Error when publish package using AWS CLI</summary>

- Make sure you code already built and `function.zip` in the same directory as `functions/` exists.
- Make sure you already installed AWS CLI on your machine. Click [here](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html#getting-started-install-instructions) to read more about how to install the AWS CLI.
- Setup IAM credentials for authentication. Click [here](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-quickstart.html) to read more about how to setup credentials.
  > **Note** </br>
  > Make sure your IAM credentials has `AWSLambda_FullAccess` policy.

</details>

<details>
  <summary>🧪 Test/invoke your Lambda</summary>

You can test/invoke your Lambda function

- via [AWS Console](https://docs.aws.amazon.com/lambda/latest/dg/testing-functions.html)
- via [AWS CLI](https://awscli.amazonaws.com/v2/documentation/api/2.3.2/reference/lambda/invoke.html)

You can check AWS CloudWatch Logs for the results. Click [here](https://docs.aws.amazon.com/lambda/latest/dg/monitoring-cloudwatchlogs.html) lo read more how to access Cloudwatch Logs from Lambda.

</details>

<details>
  <summary>⚠ Error can't publish message to Amazon MQ</summary>

- Make sure you set Lambda environment variables. Click [here](https://docs.aws.amazon.com/lambda/latest/dg/configuration-envvars.html#configuration-envvars-config) to learn how to configure Lambda environment variables.
- Use the correct Amazon MQ endpoints inside environment variable.
- Use the correct credentials (username & password) for authenticate to Amazon MQ.
- Make sure your Lambda function connected to the same VPC as Amazon MQ. Don't forget to setup your security group rules.

</details>

### Setup Web-App

> **Note** </br>
> If the settings/configurations are not specified in this guide, you can leave them as default or you can specify the values with your own.

1. Select the same AWS region as the [infrastructure](#setup-infrastructure) that has been deployed

2. Connect to EC2 instance that already created

3. Install required packages:

   - [Git](https://git-scm.com/)
   - [NodeJS](https://nodejs.org/en)
   - [NPM](https://www.npmjs.com/) or [Yarn](https://classic.yarnpkg.com/lang/en/)

4. Clone [this repository](https://github.com/zrierc/mqtt-simple-pubsub) and navigate to [`web/`](/web/)

   ```bash
   git clone https://github.com/zrierc/mqtt-simple-pubsub.git && cd mqtt-simple-pubsub/

   cd web/
   ```

5. Install required dependencies

   ```bash
   npm i
   ```

   or

   ```bash
   yarn
   ```

6. Setup enviroment variables

   - Copy `.env` boilerplate

     ```bash
     cp .env.example .env
     ```

   - Fill the required environment variables

     ```env
     BASE_URL=[http://your-domain]
     VITE_MQ_HOST=[wss://your-amazonmq-wss-endpoint:61619]
     VITE_MQ_TOPIC=broadcast
     VITE_MQ_USERNAME=[your-amazonmq-username]
     VITE_MQ_PASSWORD=[your-amazonmq-password]
     ```

7. Build web-app

   ```bash
   npm run build
   ```

   or

   ```bash
   yarn build
   ```

8. Start web-app

   > You can customize the port number. (e.g., `--port 80`)

   ```bash
   npm run preview --port 3000
   ```

   or

   ```bash
   yarn run preview --port 3000
   ```

   > **Note** </br>
   > You can also running this web-app behind [reverse proxy Nginx](https://docs.nginx.com/nginx/admin-guide/web-server/reverse-proxy/) or using [pm2](https://pm2.keymetrics.io/).

9. Open/test your web-app by accessing the public IP or public IPv4 DNS via web browsers.

#### 😕 Are you stuck?

Check this common issues:

<details>
  <summary>⚠ Can't access web-app</summary>

- Expose app publicly by adding argument `--host 0.0.0.0`. For example:
  ```bash
  yarn run preview --host 0.0.0.0 --port 3000
  ```
- Make sure your web-app running properly and can publicly accessible or if you use Nginx as reverse proxy make sure you configure Nginx properly.
- Check the security group that attached to EC2 Instance. Make sure the port that used to run the web-app is added to the inbound rules security group.

</details>

<details>
  <summary>❌ Data/message on web-app not appears</summary>

Check the browser console. If you got an error with message:

```
WebSocket connection to 'wss://abcd-ef-123-4567890.mq.ap-southeast-1.amazonaws.com:61619/' failed
```

or

```
Firefox can’t establish a connection to the server at wss://localhost:61619/.
```

You probably use the **wrong endpoint and authentication** in `.env` file. Please review and edit `.env` with following rules:

- For endpoint, use the Amazon MQ websocket (`wss`) endpoint. [Review setup `.env` file for web-app (step 6)](#setup-web-app).
- Use the same username and password as when filling out authentication and authorization on Amazon MQ. [Review setup Infrastructure (step 6)](#setup-infrastructure).

</details>

---

## 🧪 Testing

1. Invoke Lambda function with following event:

   > **Note** </br>
   > Feel free to change the `message` value.

   ```json
   {
     "message": "hello from lambda!"
   }
   ```

   <details>
    <summary>🎬 Behind the Scene</summary>

   - Lambda will receive the event that you sent, get `message` value and proccess it.

   - After the event being proccessed, **Lambda will publish** it to topic called `broadcast` on Amazon MQ using `mqtt` protocol.

   - Each payload stored in Amazon MQ.

   </datails>

2. Open the web-app that you've already deployed in web browsers and you will see message that you sent in Lambda.

   > **💡 TIP**
   >
   > If data are not shown, invoke Lambda again by repeating step 1.

   <details>
   <summary>🎬 Behind the Scene</summary>

   **Web-app subcribe topic** called `broadcast` on Amazon MQ using web socket (`wss`) protocol and display it in tabular form.

   > **Note** </br>
   > Since the data are not stored in persistent storage, if you refresh your web browsers the data will lost. However, you can still receive data again by invoking Lambda as in step 1.

---

## Improving Your Web-App

> **❗❗ First Thing First**
>
> To follow this section you MUST complete [Setup Environment](#setup-environment) section and mare sure everything runs well.

Welcome to the improvement section of this mini workshop! Here you will learn how to improve and optimize your web-app for production such as implement security best practices and add high availability to your web-app.

### Improve Security

#### Infrastructure

1. Implement custom security group to control traffic at instance level.

   Restrict inbound rule by **adding only the necessary ports and traffic to the rule**. For example, if your web-app not using port 3000 anymore you can remove it from security group. Learn more about security group [here](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-security-groups.html).

2. Implement custom network ACLs to control traffic at the subnet level.

   You can create custom network ACLs for each subnet types. For example, create custom network ACLs for public subnet(s) and private subnet(s). Learn more about network ACLs [here](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-network-acls.html).

   > **Note** </br>
   > Please remember that network ACLs are stateless, which means that any changes applied to an inbound rule will not be applied to the outbound rule (and vice versa). Also, when you create custom network ACLs by default it will deny all traffic both inbound and outbound traffic.
   >
   > There's an associated outbound rule that allows responses to incoming traffic, you can do this by adding [ephemeral ports](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-network-acls.html#nacl-ephemeral-ports) to outbound rule. **Only add the required port and traffic to the rule**.

#### Lambda function

#### Web-App

#### References

### Add High-Availability

---

## Clean Up Resources

To minimize the cost, make sure you **delete resources used in this workshop when you are finished**. Follow the sequence according to the steps to delete the AWS resources:

1. Delete Amazon MQ broker.

   > Click [here](https://docs.aws.amazon.com/amazon-mq/latest/developer-guide/amazon-mq-deleting-broker.html) to read more how to delete Amazon MQ broker.

2. Delete/terminate EC2 instance.

   > Click [here](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/terminating-instances.html#terminating-instances-console) to read more how to terminate EC2 instance.

3. Delete NAT Gateway.

   Step to delete NAT Gateway via [AWS Web Console](https://console.aws.amazon.com/):

   - Access the [Amazon VPC console](https://console.aws.amazon.com/vpc/home?#).
   - In the nativation pane, choose **NAT Gateways**.
   - Select the option button for the NAT Gateway, and then choose **Actions, Delete NAT gateway**.
   - When prompted, enter **delete** and then choose **delete**.

   > **Note** </br>
   > The NAT gateway entry might remain visible in the Amazon VPC console for an hour after removal.

   To delete a NAT gateway with the AWS Command Line Interface (AWS CLI), see [delete-nat-gateway](https://awscli.amazonaws.com/v2/documentation/api/latest/reference/ec2/delete-nat-gateway.html).

   > **Warning** </br>
   > After deleting NAT Gateways, if you no longer need the Elastic IP address that was associated with a public NAT gateway, **release the Elastic IP address**. [Learn more](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-eips.html#release-eip).

4. Delete VPC.

   > Click [here](https://docs.aws.amazon.com/vpc/latest/userguide/delete-vpc.html) to read more how to delete VPC.

   > **Note** </br>
   > If you delete a VPC using the Amazon VPC console, VPC components (e.g. Subnets, Security Groups, Route Tables, Internet Gateways, etc) are also deleted.

5. (optional) Delete credentials that stored in AWS SSM parameter store or AWS Secret Manager.

   > If you storing your credentials (username & password) Amazon MQ that stored in AWS SSM parameter store or AWS Secret Manager you can delete it by folllowing these step:
   >
   > - [Deleting AWS SSM parameter store](https://docs.aws.amazon.com/systems-manager/latest/userguide/deleting-parameters.html).
   > - [Deleting Secret Manager secret](https://docs.aws.amazon.com/secretsmanager/latest/userguide/manage_delete-secret.html).

6. (optional) Delete credentials that associated to AWS CLI.
   > Although it costs no money, for security reasons, you can delete credentials used in the AWS CLI if you don't use them anymore.
