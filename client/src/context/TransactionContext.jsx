import React,{useEffect, useState} from "react";

import {ethers} from "ethers";

import { contractABI,contractAddress } from "../utils/constants";

export const TransactionContext = React.createContext();

const {ethereum} = window;

const getEthereumContract = () => {
 
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const transactionContract = new ethers.Contract(contractAddress, contractABI, signer);

    return transactionContract;

}

export const TransactionProvider = ({children}) => {

        const [currentAccount ,setCurrentAccount] = useState('');
        const [formData,setFormData] = useState({addressTo:'',amount:'',keyword:'',message:''});
        const [isLoading,setIsLoading] = useState(false);
        const [transactionCount,setTransactionCount] = useState(localStorage.getItem("transactionCount"));
        
        const [transactions,setTransactions] = useState([]);
        const handleChange = (e,name) =>{
            setFormData((prevState) => ({...prevState,[name]:e.target.value}));
        }
        
        const getAllTransactions = async () =>{
            try{
                if(!ethereum) return alert("Please install metamask");
                    const transactionContract = getEthereumContract();

                const availableTransactions = await transactionContract.getAllTransactions();
                const structuredTransactions = availableTransactions.map((transaction) =>((transaction)=>({
                    addressTo: transaction.receiver,
                    addressFrom: transaction.sender,
                    timestamp:new Date(transaction.timestamp.toNumber()*1000).toLocaleString(),
                    message: transaction.message,
                    keyword: transaction.keyword,
                    amount: parseInt(transaction.amount._hex)/(10 ** 18)

                })))

                setTransactions(structuredTransactions);
                console.log(availableTransactions);
            }
            catch(error){
                console.log(error);
            }
        }
    const checkIfWalletIsConnected = async () => {
        try{

            if(!ethereum) return alert("Please install metamask");

            const accounts = await ethereum.request({method: 'eth_accounts'});
            if(accounts.length) {
                setCurrentAccount(accounts[0]);
                
                getAllTransactions();
            }
            else{
                console.log('No accounts found');
            }
    
        }
        catch (error){

                console.log(error);
                throw new Error("No ethereum object");
        }       
    }

    const checkIfTransactionExists = async () => {
            try{
                    const transactionContract = getEthereumContract();
                    const currentTransactionCount = await transactionContract.getTransactionCount();
                    window.localStorage.setItem("transactionCount",currentTransactionCount);
            }
            catch (error){
                console.log(error);
                throw new Error("No ethereum object");
            }
    }

    const connectWallet = async () => {

        try {

            if(!ethereum) return alert("Please install metamask");

            const accounts = await ethereum.request({method: 'eth_requestAccounts'});
            setCurrentAccount(accounts[0]);       
        }
        catch (error) {
                console.log(error);

                throw new Error("No ethereum object");  
        }
    }

    const sendTransaction = async () => {
        try{
            if(ethereum)
        { 
            //get data from form
            const {addressTo,amount,keyword,message} = formData;
            const transactionContract=getEthereumContract();
            const parsedAmount = ethers.utils.parseEther(amount);

            await ethereum.request({
                method: 'eth_sendTransaction',
                params:[{
                    from: currentAccount,
                    to: addressTo,
                    gas: '0x5208', //2100 GWEI
                    value: parsedAmount._hex,
                }]
            });

            const transactionHash = await transactionContract.addToBlockchain(addressTo,parsedAmount,message,keyword);
            setIsLoading(true);
            console.log(`Loading - ${transactionHash.hash}`);
            await transactionHash.wait();
            console.log(`Success - ${transactionHash.hash}`);
            setIsLoading(false);


            const transactionsCount = await transactionContract.getTransactionCount();

            setTransactionCount(transactionsCount.toNumber());
            
        }
        else {
            console.log("No ethereum object");
          }
    }
        catch (error) {
            console.log(error);

                throw new Error("No ethereum object"); 
        }
    }


    useEffect(() => {
            checkIfWalletIsConnected();
            checkIfTransactionExists();
    },[]);

    return (
            <TransactionContext.Provider value={{ transactionCount, connectWallet , currentAccount , formData, setFormData, handleChange, sendTransaction, transactions, isLoading}}>
                {children}
            </TransactionContext.Provider>
    );
}