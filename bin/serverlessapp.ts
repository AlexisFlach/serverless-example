#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { ServerlessAppStack } from '../lib/serverlessapp-stack';

const app = new cdk.App();
new ServerlessAppStack(app, 'ServerlessAppStack');
