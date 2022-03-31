import {
  Button,
  Card,
  Center,
  Container,
  Group,
  Image,
  NumberInput,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { ColorSchemeToggle } from '../components/ColorSchemeToggle/ColorSchemeToggle';
import { WithMetamask, MetamaskContext } from '../components/MetamaskConnect';
import { NotificationsContextProps } from '@mantine/notifications/lib/types';
import { useNotifications } from '@mantine/notifications';
import { Web3Provider, Contract, utils as zkUtils } from 'zksync-web3';
import React from 'react';
import getNFTContract from '../contracts/NFT';
import { BigNumber, ethers } from 'ethers';
import getDisplayContract from '../contracts/Display';

// props interface
interface IProps {
  notifications: NotificationsContextProps;
}
// state interface
interface IState {
  provider?: Web3Provider;

  feeToken: {
    symbol: string;
    address: string;
    decimals: number;
  };

  intervalId?: NodeJS.Timer;

  mintingFees?: string;
  promoteFees?: string;
  approveFees?: string;

  paymentToken: {
    symbol: string;
    address: string;
    decimals: number;
  };
  nftContract?: Contract;
  displayContract?: Contract;
  erc20Contract?: Contract;

  nft?: {
    uri: string;
    id: number;
    payment: bigint;
  };

  imageUrl: string;
  tokenId?: number;
  paymentAmount: bigint;

  allowance?: bigint;
}

class App extends React.Component<IProps, IState> {
  static contextType = MetamaskContext;

  constructor(props: any) {
    super(props);

    this.state = {
      // TODO: adjust this if needed
      feeToken: {
        symbol: 'DAI',
        address: '0x5C221E77624690fff6dd741493D735a17716c26B',
        decimals: 18,
      },
      paymentToken: {
        symbol: 'DAI',
        address: '0x5C221E77624690fff6dd741493D735a17716c26B',
        decimals: 18,
      },

      // ui variables
      imageUrl: '',
      paymentAmount: BigInt(0),
    };
  }

  async loadNft() {
    const { provider, displayContract, nftContract } = this.state;
    if (!provider || !displayContract || !nftContract) return;

    // TODO: implement
  }

  async mint() {
    const { nftContract, imageUrl, feeToken } = this.state;
    if (!nftContract) return;

    // TODO: implement
  }

  async estimateMintingFees() {
    const { nftContract, imageUrl, feeToken, provider } = this.state;
    if (!nftContract || !provider || !imageUrl) return;

    // TODO: implement this

    try {
      const feeInGas = await nftContract.estimateGas.mintNFT(imageUrl, {
        customData: {
          feeToken: feeToken.address,
        },
      });
      const gasPriceInUnits = await provider.getGasPrice(feeToken.address);
      const mintingFees = ethers.utils.formatUnits(
        feeInGas.mul(gasPriceInUnits),
        feeToken.decimals
      );

      this.setState({ mintingFees });
    } catch (_) {}
  }

  async fetchAllowance() {
    const { erc20Contract, displayContract, provider } = this.state;
    const { account } = this.context;
    if (!provider || !displayContract || !erc20Contract) return;

    // TODO: implement this
  }

  async approve() {
    const { provider, erc20Contract, displayContract, paymentAmount, feeToken, paymentToken } = this.state;
    if (!provider || !displayContract || !erc20Contract || !paymentAmount) return;

    // TODO: implement this
  }

  async estimateApproveFees() {
    const { provider, erc20Contract, displayContract, paymentAmount, feeToken, paymentToken } = this.state;
    if (!provider || !displayContract || !erc20Contract || !paymentAmount) return;

    // TODO: implement this
  }

  async promote() {
    const { provider, displayContract, paymentAmount, feeToken, tokenId, paymentToken, nft } =
      this.state;
    if (!provider || !displayContract) return;

    if (!tokenId || !paymentAmount) {
      this.nfTransactionFailed('Invalid input!', 'Please set token id and payment amount!');
      return;
    }

    if (nft && nft.payment >= paymentAmount) {
      this.nfTransactionFailed(
        'Invalid input!',
        'New payment amount has to be higher than the highest one!'
      );
      return;
    }

    // TODO: implement this
  }

  async estimatePromoteFees() {
    const { provider, displayContract, paymentAmount, feeToken, tokenId } = this.state;
    if (!provider || !displayContract || !paymentAmount || !tokenId) return;

    // TODO: implement this
  }

  // notification helper functions
  nfTransactionPending() {
    this.props.notifications.clean();

    this.props.notifications.showNotification({
      title: 'Transaction in process!',
      message: 'Your transaction will be shortly added to the blockchain.',
      color: 'yellow',
      disallowClose: true,
      loading: true,
      autoClose: false,
    });
  }

  nfTransactionSuccess(title: string, message: string) {
    this.props.notifications.clean();

    this.props.notifications.showNotification({
      title: title,
      message: message,
      color: 'green',
    });
  }

  nfTransactionFailed(title?: string, reason?: string) {
    this.props.notifications.clean();

    this.props.notifications.showNotification({
      title: title || 'Error!',
      message: reason || 'Something went wrong!',
      color: 'red',
      autoClose: 5000,
    });
  }

  update() {
    this.loadNft();
    this.fetchAllowance();
    this.estimateMintingFees();
    this.estimateApproveFees();
    this.estimatePromoteFees();
  }

  componentDidMount() {
    const provider = new Web3Provider(this.context.ethereum);
    const displayContract = getDisplayContract(provider);
    const nftContract = getNFTContract(provider);
    const erc20Contract = new Contract(this.state.paymentToken.address, zkUtils.IERC20, provider.getSigner());

    const intervalId = setInterval(() => this.update(), 10000);

    this.setState({
      provider,
      nftContract,
      displayContract,
      erc20Contract,
      intervalId,
    });
  }

  componentWillUnmount() {
    if (this.state.intervalId) clearInterval(this.state.intervalId);
  }

  componentDidUpdate(_prevProps: IProps, prevState: IState) {
    if (prevState.imageUrl !== this.state.imageUrl || !this.state.mintingFees)
      this.estimateMintingFees();

    if (
      this.state.allowance &&
      this.state.paymentAmount &&
      this.state.allowance >= this.state.paymentAmount
    ) {
      if (
        prevState.tokenId !== this.state.tokenId ||
        prevState.paymentAmount !== this.state.paymentAmount
      )
        this.estimatePromoteFees();
    } else {
      if (prevState.paymentAmount !== this.state.paymentAmount) this.estimateApproveFees();
    }

    if (!this.state.allowance) this.fetchAllowance();

    if (!this.state.nft) this.loadNft();
  }

  render() {
    const {
      nft,
      imageUrl,
      allowance,
      paymentAmount,
      tokenId,
      mintingFees,
      promoteFees,
      approveFees,
      feeToken,
      paymentToken,
    } = this.state;

    const promotePanel =
      allowance && paymentAmount !== undefined && allowance >= paymentAmount ? (
        <Group grow direction="row">
          <Text>
            Estimated promotion fees: {promoteFees} {paymentToken.symbol}
          </Text>
          <Button color="indigo" radius="md" onClick={() => this.promote()}>
            Promote
          </Button>
        </Group>
      ) : (
        <Group grow direction="row">
          <Text>
            Estimated approval fees: {approveFees} {paymentToken.symbol}
          </Text>
          <Button color="indigo" radius="md" onClick={() => this.approve()}>
            Approve
          </Button>
        </Group>
      );

    return (
      <>
        <div
          style={{
            position: 'fixed',
            top: 0,
            right: 0,
            margin: 12,
          }}
        >
          <ColorSchemeToggle />
        </div>

        <Container>
          <Group direction="column" grow>
            <Title
              sx={{ fontSize: 42, fontWeight: 900, letterSpacing: -2 }}
              align="center"
            >
              Welcome to{' '}
              <Text inherit variant="gradient" component="span">
                NFT Display
              </Text>
            </Title>

            <Card>
              <Image src={nft?.uri} withPlaceholder fit="contain" height={384} />
              <Text color="dimmed" align="center" size="lg" mx="auto" mt="xl">
                NFT #{nft?.id} is being displayed. The promoter paid{' '}
                {nft && ethers.utils.formatUnits(nft.payment, paymentToken.decimals)}{' '}
                {feeToken.symbol} for promoting it.
              </Text>
            </Card>

            <Card>
              <Group direction="column" grow>
                <Center>
                  <Title order={2}>
                    Mint your{' '}
                    <Text inherit variant="gradient" component="span">
                      NFT
                    </Text>{' '}
                    now!
                  </Title>
                </Center>

                <Group grow align="end">
                  <TextInput
                    placeholder="https://example.com/my-image.png"
                    label="Image URL"
                    description={`Estimated minting fees: ${mintingFees ? mintingFees : '...'} ${
                      feeToken.symbol
                    }`}
                    value={imageUrl}
                    onChange={(e) => this.setState({ imageUrl: e.currentTarget.value })}
                  />
                  <Button color="indigo" radius="md" onClick={() => this.mint()}>
                    Mint
                  </Button>
                </Group>
              </Group>
            </Card>

            <Card>
              <Group direction="column" grow>
                <Center>
                  <Title order={2}>
                    Promote your{' '}
                    <Text inherit variant="gradient" component="span">
                      NFT
                    </Text>{' '}
                    now!
                  </Title>
                </Center>
                <Group grow align="end">
                  <NumberInput
                    precision={0}
                    min={1}
                    step={1}
                    placeholder="69"
                    label="Token id"
                    value={tokenId}
                    onChange={(e) => this.setState({ tokenId: e })}
                    hideControls
                  />
                  <TextInput
                    label="Payment amount"
                    value={ethers.utils.formatUnits(paymentAmount, paymentToken.decimals)}
                    onChange={(e) => {
                      try {
                        this.setState({
                          paymentAmount: ethers.utils
                            .parseUnits(e.currentTarget.value, paymentToken.decimals)
                            .toBigInt(),
                        });
                      } catch (_) {}
                    }}
                  />
                </Group>
                {promotePanel}
              </Group>
            </Card>
          </Group>
        </Container>
      </>
    );
  }
}

export default function Index() {
  const notifications = useNotifications();

  return (
    <WithMetamask>
      <App notifications={notifications} />
    </WithMetamask>
  );
}
