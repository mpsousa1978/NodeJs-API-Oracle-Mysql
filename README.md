
## Installation

```bash
$ npm install
```
## database
npm i oracledb // Banco de dados OracleDB.
npm install --save mysql2 // Banco de dados mysql.

## table
create table portaria_festa_junina(
  id_portaria_festa_junina  INT NOT NULL AUTO_INCREMENT,
  id_cupom int not null,
  ingresso int not null,
  qrcode varchar(50),
  id_estab int not null,
  id_setor int not null,
  matricula int not null,
  nome varchar(200) not null,
  idade int not null,
  nascimento datetime not null,
  sexo varchar(2) not null,
  Parentesco varchar(50) not null,
  check_in datetime null,
  valor int not null, 
  faixa_idade varchar(40),
  cpf  varchar(15),
  sorteio int null,
  condicao  varchar(50) null
  PRIMARY KEY (id_portaria_festa_junina)
)



#Ambiente de desenvolvimento
DEBUG=true

#Conexão oracle
ORACLE_USER=integracao_api
ORACLE_PASSWORD=iwn_3pw
#ORACLE_CONNECT_STRING_PRODUCTION=""
#ORACLE_CONNECT_STRING_DEV=""
ORACLE_CONNECT_STRING_PRODUCTION=""
ORACLE_CONNECT_STRING_DEV =""
# MYSQL
MYSQL_HOST="localhost"
MYSQL_USER="admin"
MYSQL_PORT=3306
MYSQL_PASSWORD="admin"
MYSQL_DATABASE="teste"