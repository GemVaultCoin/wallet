module.exports = {
	'ContractOwner':	'0x88c25d3Ea2603c3654aC9F6af7245C63d0329605',
	'ContractCentralAddress': '0xF5B4A479203d8d9dc153188CdAC3541D38cCDC8b',
	'ContractCentralPassphrase': 'd91ea597d82365b2f10fb409e8a221b92f1e7329eeddba8e4515f6f777893eb71332719f18c4e9d63d11feae2f531ae2e889b9c21289',
	'ContractAddress': '0x538112f374B336E7b2b315947d259D12054dE0F8',

	'keystorePath':	'/home/ubuntu/.ethereum',//for importing private key
	'IpcProvider': '/Users/koalevskii/Library/Ethereum/geth.ipc',
	'RpcProvider': 'https://rinkeby.infura.io/8m9GjFe5QIkDl78RDNdS',

	'fromBlock': '4099813',

	'emailerPreText'					:	'https://wallet.ethms.io/',
	'DBurl'								:	'mongodb://127.0.0.1:27017/ETHMS',
	'DBname'							:	'ETHMS',

	'TokenName'							:	'Ethereum Shares',
	'TokenSymbol'						:	'ETHMS',
	'TokenTotalSupply'					:	'6000000000000',//including 4 decimal(600000000 ETHMS)
	'TokenPrice'						:	'3000000',//including 4 decimal (1ETHMS=300USD)
	'TokenDecimalPlace'					:	'10000',//4 decimals
	'IcoEndDate'						: 	'Monday, 26 March 2018 2:30:00',//jan 18, 2018 18:30:00

	'JWTSECRET'							:	'0x61B8DE7A093325542486910D0463983ffb6E65Aa',

	'noreplyemail'						: 	'noreply@mail.ethms.io',
	// 'noreplyemail'						: 	'support@ethms.io',
	'noreplyemailPass'					: 	'ethms@123',
	'exportDayLimit': 30,
	'GasLimit':	200000,
	'ChainId': 4,
	'SESSION_CL': 'sessions'
}
