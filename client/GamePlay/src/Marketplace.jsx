// import React, { useEffect, useState } from 'react';
// import { useNavigate, Link } from 'react-router-dom';
// import styled from 'styled-components';
// import { ConnectButton, useActiveAccount } from "thirdweb/react";
// import { toast, ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import { client } from "./client";
// import { createWallet, inAppWallet } from "thirdweb/wallets";
// import { connectSdk } from "./utils/connect-sdk.js";

// const wallets = [
//   inAppWallet({
//     auth: {
//       options: [
//         "email",
//         "google",
//         "phone",
//       ],
//     },
//   }),
//   createWallet("io.metamask"),
// ];

// const Container = styled.div`
//   display: flex;
//   flex-direction: column;
//   align-items: center;
//   padding: 20px;
// `;

// const CardContainer = styled.div`
//   display: flex;
//   justify-content: space-around;
//   max-width: 1200px;
//   width: 100%;
//   padding: 20px;
//   gap: 20px;
// `;

// const Card = styled.div`
//   background-color: #eeeee4;
//   border-radius: 8px;
//   padding: 20px;
//   box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
//   text-align: center;
//   width: 30%;
//   cursor: pointer;
// `;

// const CarImage = styled.img`
//   max-width: 100%;
//   border-radius: 8px;
//   margin-bottom: 20px;
// `;

// const Button = styled.button`
//   background-color: #0ed1e0;
//   color: #fff;
//   border: none;
//   border-radius: 4px;
//   padding: 10px 20px;
//   cursor: pointer;
//   margin: 1rem;
// `;

// const Marketplace = () => {
//   const activeAccount = useActiveAccount();
//   const address = activeAccount?.address;
//   const navigate = useNavigate();
  
//   console.log(address);

//   const mintNFT = async (tokenId) => {
//     if (!address) {
//       toast.error('Please connect your wallet first.');
//       return;
//     }

//     const { sdk } = await connectSdk();
//     const collectionId = 3286;

//     try {
//       toast.info('Minting in progress...');
//       await sdk.token.transfer({
//         collectionId,
//         tokenId,
//         to: address,
//       });
//       toast.success(`NFT with ID ${tokenId} from collection ${collectionId} transferred to ${address}`);
//       navigate('/lobby');
//     } catch (error) {
//       toast.error("Error transferring NFT:", error.message);
//       console.error("Error transferring NFT:", error);
//     }
//   };

//   return (
//     <Container>
//       <ToastContainer />
//       <ConnectButton
//         theme={"light"}
//         btnTitle={"Login"}
//         modalTitle={"Select a Wallet"}
//         modalSize={"compact"}
//         modalTitleIconUrl={""}
//         dropdownPosition={{
//           side: "left",
//           align: "end",
//         }}
//         client={client}
//         wallets={wallets}
//       />
//       {address && (
//         <Button>
//           <Link to="/" style={{ textDecoration: 'none', color: '#fff' }}>Back</Link>
//         </Button>
//       )}
//       <CardContainer>
//         <Card>
//           <CarImage src="/car1.webp" alt="Car 1" />
//           <h3>Supra</h3>
//           <p>Description of Car 1.</p>
//           <Button onClick={() => mintNFT(27)}>Mint Car 1</Button>
//         </Card>
//         <Card >
//           <CarImage src="/car2.webp" alt="Car 2" />
//           <h3>McQueen</h3>
//           <p>Description of Car 2.</p>
//           <Button onClick={() => mintNFT(30)}>Mint Car 2</Button>
//         </Card>
//         <Card >
//           <CarImage src="/car3.webp" alt="Car 3" />
//           <h3>Civic</h3>
//           <p>Description of Car 3.</p>
//           <Button onClick={() => mintNFT(31)}>Mint Car 3</Button>
//         </Card>
//         <Card >
//           <CarImage src="/car4.webp" alt="Car 3" />
//           <h3>Beast</h3>
//           <p>Description of Car 4.</p>
//           <Button onClick={() => mintNFT(32)}>Mint Car 4</Button>
//         </Card>
//       </CardContainer>
//     </Container>
//   );
// };

// export default Marketplace;
