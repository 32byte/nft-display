// ui
import { Alert, Button, Center, Container, Group } from '@mantine/core';
import ReactDOM from 'react-dom';
import React, { ReactNode, useEffect, useState } from 'react';
// metamask
import detectEthereumProvider from '@metamask/detect-provider';
import { MetaMaskInpageProvider } from '@metamask/providers';
import { AlertCircle } from 'tabler-icons-react';

interface Chain {
  id: number;
  name: string;
}

interface IMetamaskContext {
  ethereum: MetaMaskInpageProvider | undefined;
  account: string;
}

const defaultContext: IMetamaskContext = {
  ethereum: undefined,
  account: '',
};

const MetamaskContext = React.createContext<IMetamaskContext>(defaultContext);

const MetamaskNotFound = () => {
  return (
    <Container style={{ height: '100vh' }}>
      <Group position="center" direction="row" style={{ height: '100%' }}>
        <Alert icon={<AlertCircle size={16} />} title="Please install Metamask!" color="red">
          Metamask is required to view this page!
        </Alert>
      </Group>
    </Container>
  );
};

const WrongChainId = ({ chain }: { chain: Chain }) => {
  return (
    <Container style={{ height: '100vh' }}>
      <Group position="center" direction="row" style={{ height: '100%' }}>
        <Alert icon={<AlertCircle size={16} />} title="You are on the wrong chain!" color="red">
          Please switch to {chain.name}
        </Alert>
      </Group>
    </Container>
  );
};

const NotConnected = ({ connect }: { connect: () => void }) => {
  return (
    <Container style={{ height: '100vh' }}>
      <Group position="center" direction="row" style={{ height: '100%' }}>
        <Alert title="Please connect to Metamask!" color="blue">
          <Center>
            <Button variant="outline" onClick={connect}>
              connect
            </Button>
          </Center>
        </Alert>
      </Group>
    </Container>
  );
};

const WithMetamask = ({
  children,
  requiredChain,
}: {
  children: ReactNode;
  requiredChain?: Chain;
}) => {
  const [ethereum, setEthereum] = useState<MetaMaskInpageProvider | undefined>(undefined);
  const [account, setAccount] = useState<any>(undefined);
  const [chainId, setChainId] = useState<number>(-1);
  const [connected, setConnected] = useState<boolean>(false);

  // event listeners
  const onChainChanged = () => {
    // reload window
    window.location.reload();
  };

  const onAccountsChanged = (accounts: unknown) => {
    const accs = accounts as any[];

    if (accs.length === 0) {
      setConnected(false);
    } else if (accs[0] != account) {
      ReactDOM.unstable_batchedUpdates(() => {
        setAccount(accs[0]);
        if (!connected) setConnected(true);
      });
    }
  };

  const connect = () => {
    if (!ethereum) return;

    ethereum
      .request({ method: 'eth_requestAccounts' })
      .then(onAccountsChanged)
      .catch((_) =>
        ReactDOM.unstable_batchedUpdates(() => {
          setAccount(undefined);
          setConnected(true);
        })
      );
  };

  // load the ethereum provider
  useEffect(() => {
    let cancel = false;

    const loadProvider = async () => {
      const provider = (await detectEthereumProvider()) as MetaMaskInpageProvider;
      // return if cancelled
      if (cancel) return;
      // set provider if is defined
      if (provider) {
        // register event listeners
        provider.on('chainChanged', onChainChanged);
        provider.on('accountsChanged', onAccountsChanged);
        // load chain id
        const chainId = Number(await provider.request({ method: 'eth_chainId' }));

        // set variables
        ReactDOM.unstable_batchedUpdates(() => {
          setChainId(chainId);
          setEthereum(provider);
        });
      }
    };

    loadProvider().catch(console.error);

    return () => {
      cancel = true;
    };
  }, []);

  // metamask is not installed
  if (!ethereum) return <MetamaskNotFound />;

  // wrong chain id
  if (requiredChain && requiredChain.id != chainId) return <WrongChainId chain={requiredChain} />;

  // request accounts
  if (!account) {
    ethereum.request({ method: 'eth_accounts' }).then(onAccountsChanged);
  }

  if (!connected) return <NotConnected connect={connect} />;

  return (
    <MetamaskContext.Provider value={{ ethereum: ethereum, account: account }}>
      {children}
    </MetamaskContext.Provider>
  );
};

export { WithMetamask, MetamaskContext };
