/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

const AWS = require('aws-sdk'); // have to use V2 SDK, because V3 doesn't support initiating credential object form access key and secret key
const { Client } = require('@opensearch-project/opensearch');
const { AwsSigv4Signer } = require('@opensearch-project/opensearch/aws');
const { fromTemporaryCredentials } = require('@aws-sdk/credential-providers'); // ES6 import

const awsUserCredential = new AWS.Credentials({
  accessKeyId: 'a',
  secretAccessKey: 'a',
});

const USER_BASED_IAM_TEST_DOMAIN =
  'https://search-test-md-iam-t4nrqxkk7fpfd7qxwkbzqbyqbm.us-west-2.es.amazonaws.com';

const STS_TEST_DOMAIN =
  'https://search-test-md-iam-sts-djspwbplwcto5rateanwyqdrgm.us-west-2.es.amazonaws.com';

const getClient = (sigV4Type, url, credentials) => {
  let credentialProvider;

  if (sigV4Type === 'STS') {
    credentialProvider = fromTemporaryCredentials({
      // optional: if not provided, it uses defaultsProvider
      masterCredentials: credentials,
      // required
      params: {
        RoleArn: 'a',
      },
    });
  } else if (sigV4Type === 'IAM user') {
    credentialProvider = new Promise((resolve, reject) => {
      if (credentials) {
        resolve(credentials);
      } else {
        reject('something wrong');
      }
    });
  }

  const client = new Client({
    // Must return a Promise that resolve to an AWS.Credentials object.
    // This function is used to acquire the credentials when the client start and
    // when the credentials are expired.
    // The Client will refresh the Credentials only when they are expired.
    // With AWS SDK V2, Credentials.refreshPromise is used when available to refresh the credentials

    // eslint-disable-next-line new-cap
    ...AwsSigv4Signer({
      region: 'us-west-2',
      // Any other method to acquire a new Credentials object can be used.
      getCredentials: credentialProvider,
    }),
    node: url,
  });

  return client;
};

/**
 * Testing by _cat/indices
 */

const queryClient = getClient('STS', STS_TEST_DOMAIN, awsUserCredential);
//const queryClient = getClient('IAM user', USER_BASED_IAM_TEST_DOMAIN, awsUserCredential);

queryClient.cat.indices((error, res) => {
  if (error) {
    console.error('opensearch cluster is down!');
    console.error(error);
  } else {
    console.log('All is well');
    console.log(res.body);
  }
});
