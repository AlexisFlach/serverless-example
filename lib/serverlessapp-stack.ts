import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as apigateway from '@aws-cdk/aws-apigateway';
import * as dynamodb from '@aws-cdk/aws-dynamodb';
import * as logs from '@aws-cdk/aws-logs';
import * as iam from '@aws-cdk/aws-iam';

export class ServerlessAppStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const table = new dynamodb.Table(this, 'ClubsTable', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
    });

    table.addGlobalSecondaryIndex({
      indexName: 'nation-index',
      partitionKey: { name: 'nation', type: dynamodb.AttributeType.STRING },
    });

    const logGroup = new logs.LogGroup(this, 'Cm2LoggerGroup', {
      logGroupName: 'Cm2LoggerGroup',
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const logStream = new logs.LogStream(this, 'CM2LogStream', {
      logGroup: logGroup,
      logStreamName: 'CM2LogStreamName',
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const getClubsLambda = new lambda.Function(this, 'GetClubsFunction', {
      runtime: lambda.Runtime.NODEJS_16_X,
      handler: 'getClubs.handler',
      code: lambda.Code.fromAsset('src/lambda'),
      environment: {
        TABLE_NAME: table.tableName,
        LOG_GROUP_NAME: logGroup.logGroupName,
        LOG_STREAM_NAME: logStream.logStreamName,
      },
    });

    const createClubLambda = new lambda.Function(this, 'CreateClubFunction', {
      runtime: lambda.Runtime.NODEJS_16_X,
      handler: 'createClub.handler',
      code: lambda.Code.fromAsset('src/lambda'),
      environment: {
        TABLE_NAME: table.tableName,
        LOG_GROUP_NAME: logGroup.logGroupName,
        LOG_STREAM_NAME: logStream.logStreamName,
      },
    });

    const deleteClubLambda = new lambda.Function(this, 'DeleteClubFunction', {
      runtime: lambda.Runtime.NODEJS_16_X,
      handler: 'deleteClub.handler',
      code: lambda.Code.fromAsset('src/lambda'),
      environment: {
        TABLE_NAME: table.tableName,
        LOG_GROUP_NAME: logGroup.logGroupName,
        LOG_STREAM_NAME: logStream.logStreamName,
      },
    });

    const filterClubsByNationLambda = new lambda.Function(
      this,
      'FilterClubsByNationFunction',
      {
        runtime: lambda.Runtime.NODEJS_16_X,
        handler: 'filterClubsByNation.handler',
        code: lambda.Code.fromAsset('src/lambda'),
        environment: {
          TABLE_NAME: table.tableName,
          LOG_GROUP_NAME: logGroup.logGroupName,
          LOG_STREAM_NAME: logStream.logStreamName,
        },
      }
    );

    table.grantReadWriteData(getClubsLambda);
    table.grantReadWriteData(createClubLambda);
    table.grantReadWriteData(deleteClubLambda);
    table.grantReadWriteData(filterClubsByNationLambda);

    filterClubsByNationLambda.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['dynamodb:Query'],
        resources: [table.tableArn, `${table.tableArn}/index/nation-index`],
      })
    );

    const api = new apigateway.RestApi(this, 'ClubsApi', {
      restApiName: 'Clubs Service',
      description: 'This service serves clubs.',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['Content-Type', 'X-Api-Key'],
      },
    });

    const apiKey = api.addApiKey('ApiKey');
    const plan = api.addUsagePlan('UsagePlan', {
      name: 'Basic',
      apiKey: apiKey,
      throttle: {
        rateLimit: 100,
        burstLimit: 200,
      },
    });

    plan.addApiStage({
      stage: api.deploymentStage,
    });

    const clubs = api.root.addResource('clubs');
    const getIntegration = new apigateway.LambdaIntegration(getClubsLambda);
    const postIntegration = new apigateway.LambdaIntegration(createClubLambda);
    const filterIntegration = new apigateway.LambdaIntegration(
      filterClubsByNationLambda
    );

    clubs.addMethod('GET', getIntegration, {
      apiKeyRequired: true,
    });
    clubs.addMethod('POST', postIntegration, {
      apiKeyRequired: true,
    });

    const club = clubs.addResource('{id}');
    const deleteIntegration = new apigateway.LambdaIntegration(
      deleteClubLambda
    );
    club.addMethod('DELETE', deleteIntegration, {
      apiKeyRequired: true,
    });

    const nation = api.root.addResource('nation');
    nation.addMethod('GET', filterIntegration, {
      apiKeyRequired: true,
    });
  }
}
