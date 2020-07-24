import React, { useEffect, useState } from 'react';
import { Form, Input, Grid } from 'semantic-ui-react';

import { useSubstrate } from './substrate-lib';
import { TxButton } from './substrate-lib/components';
import { blake2AsHex } from '@polkadot/util-crypto';

function Main (props) {
  const { api } = useSubstrate();
  const { accountPair } = props;

  // The transaction submission status
  const [status, setStatus] = useState('');
  const [digest, setDigest] = useState('');
  const [accountId, setAccountId] = useState('5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty');
  const [owner, setOwner] = useState('');
  const [blockNumber, setBlockNumber] = useState(0);

  useEffect(() => {
    let unsubscribe;
    api.query.poeModule.proofs(digest, (result) => {
      setOwner(result[0].toString());
      setBlockNumber(result[1].toNumber());
    }).then(unsub => {
      unsubscribe = unsub;
    })
      .catch(console.error);

    return () => unsubscribe && unsubscribe();
  }, [digest, api.query.poeModule]);

  const handleFileChosen = (file) => {
    const fileReader = new FileReader();

    const bufferToDigest = () => {
      const content = Array.from(new Uint8Array(fileReader.result))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');

      const hash = blake2AsHex(content, 256);
      console.log(hash);
      setDigest(hash);
    };

    fileReader.onloadend = bufferToDigest;
    fileReader.readAsArrayBuffer(file);
  };

  return (
    <Grid.Column width={8}>
      <h1>poe module for test</h1>
      <Form>
        <Form.Field>
          <Input
            type='file'
            id='file'
            lable='Your File'
            onChange={(e) => handleFileChosen(e.target.files[0])}
          />
        </Form.Field>
        <Form.Field>
          <TxButton
            accountPair = {accountPair}
            label='Create Claim'
            setStatus={setStatus}
            type='SIGNED-TX'
            attrs={{
              palletRpc: 'poeModule',
              callable: 'createClaim',
              inputParams: [digest],
              paramFields: [true]
            }}
          />
          <TxButton
            accountPair = {accountPair}
            label='revoke Claim'
            setStatus={setStatus}
            type='SIGNED-TX'
            attrs={{
              palletRpc: 'poeModule',
              callable: 'revokeClaim',
              inputParams: [digest],
              paramFields: [true]
            }}
          />
          <TxButton
            accountPair = {accountPair}
            label='transfer Claim'
            setStatus={setStatus}
            type='SIGNED-TX'
            attrs={{
              palletRpc: 'poeModule',
              callable: 'transferClaim',
              inputParams: [digest, accountId],
              paramFields: [true]
            }}
          />
        </Form.Field>
        <div>{status}</div>
        <div>{`Claim info, owner: ${owner}, blockNumber: ${blockNumber}`}</div>
      </Form>
    </Grid.Column>
  );
}

export default function PoeModule (props) {
  const { api } = useSubstrate();
  return (api.query.poeModule && api.query.poeModule.proofs
    ? <Main {...props} /> : null);
}
