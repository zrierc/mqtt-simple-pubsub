# MQTT — Simple Pub/Sub using NodeJS

#### Tables of Contents:

- [Overview](#overview)
- [Project Structure](#project-structure)

---

## Overview

Welcome to mini workshop about MQTT using AmazonMQ - Lambda Function - ReactJS! Please take a look the architecture below.

<p align="center">
<img src="./architecture.png">
</p>

In this mini workshop, you will learn both about publishing and subscribing messages using MQTT. You will also learn how to setup/deploy web-app and lambda function in AWS.

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
