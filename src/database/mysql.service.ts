/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
import { Injectable, OnModuleDestroy } from '@nestjs/common';
import * as mysql from 'mysql2/promise';
import { DadosIngressos } from 'src/dtos/DadosIngressos';
import { GetIngresso } from 'src/dtos/GetIngresso';
import { QRCode } from 'src/dtos/QRCode';
import { Status } from 'src/dtos/Status';
import { DadosIngressosMysql } from 'src/dtos/dadosIngressosMysql';


@Injectable()
export class MysqlService implements OnModuleDestroy {
  private connection: mysql.Connection;
  private isConnected = false;

  constructor() {
    this.connect();
  }

  async connect() {
    if (!this.isConnected) {
      try {
        this.connection = await mysql.createConnection({
          host: process.env.MYSQL_HOST,
          user: process.env.MYSQL_USER,
          port: Number(process.env.MYSQL_PORT),
          password: process.env.MYSQL_PASSWORD,
          database: process.env.MYSQL_DATABASE,
        });
        this.isConnected = true;
        console.log(`Conectado ao mysql:${process.env.MYSQL_DATABASE}`)
      } catch (error) {
        setTimeout(() => this.connect(), 5000);
      }
    }
    return this.connection;
  }

  async getConnection(): Promise<mysql.Connection> {
    if (!this.isConnected) {
      await this.connect();
    }

    try {
      await this.connection.ping();
    } catch (error) {
      console.log('[MYSQL] Error while verifying connection.');
      this.isConnected = false;
      await this.connect();
    }

    return this.connection;
  }

  async onModuleDestroy(): Promise<void> {
    await this.disconnect();
  }

  private async disconnect() {
    if (this.connection) {
      await this.connection.end();
      this.connection = null;
      this.isConnected = false;
      console.log('[MYSQL] Disconnected from MySQL DB.');
    }
  }

  async checkStatus(): Promise<boolean> {
    try {
      const connection = await this.getConnection();
      await connection.query('SELECT 1 from dual');
      return true;
    } catch (error) {
      console.log('[MYSQL] Error checking MySQL DB status.');
      this.isConnected = false;
      await this.connect();
      return false;
    }
  }


  async delete(pSql: string): Promise<void> {
    try {
      const connection = await this.getConnection();

      const [rows, fields] = await connection.query(pSql)
    } catch (error) {
      console.error(`Error when clear base: ${error}`);
    }
  }

  async getLista(pSql: string): Promise<GetIngresso> {
    try {
      const connection = await this.getConnection();

      const [rows, fields] = await connection.query(pSql)

      //const lista: DadosIngressos[] = rows as unknown as DadosIngressos[];

      const listaIngresso: DadosIngressos[] = [];
      const result = rows as unknown as DadosIngressosMysql[];

      for (const row of result) {
        const rowData = row as unknown as DadosIngressosMysql;
        const ingressoData: DadosIngressos = {
          id_cupom: rowData.id_cupom,
          id_portaria_festa_junina: rowData.id_portaria_festa_junina,
          ingresso: rowData.ingresso,
          qrcode: rowData.qrcode,
          id_estab: rowData.id_estab,
          id_setor: rowData.id_setor,
          matricula: rowData.matricula,
          nome: rowData.nome,
          idade: rowData.idade,
          nascimento: rowData.nascimento,
          sexo: rowData.sexo,
          parentesco: rowData.parentesco,
          check_in: rowData.check_in,
          valor: rowData.valor,
          sorteio: rowData.sorteio,
          faixa_idade: rowData.faixa_idade,
          cpf: rowData.cpf,
          condicao: rowData.condicao,
        }

        listaIngresso.push(ingressoData)
      }

      if (listaIngresso.length > 0) {
        const resultFormat: GetIngresso = {
          po_retorno: 1,
          po_msg: '',
          po_rs: listaIngresso
          //po_rs: lista
        }
        return resultFormat;
      } else {
        const resultFormat: GetIngresso = {
          po_retorno: 2,
          po_msg: 'Não encontrado registro',
          po_rs: []
          //po_rs: lista
        }
        return resultFormat;
      }


    } catch (err) {
      console.error(err);
    }
  }

  async findIngresso(ingresso: string): Promise<QRCode> {
    try {
      const connection = await this.getConnection();
      //const [rowsd, fieldsd] = await connection.execute("update afpesp.portaria_festa_junina set check_in =null ")

      const [rows, fields] = await connection.execute("select * from afpesp.portaria_festa_junina where ingresso= ?", [ingresso])

      const qrcoderesult = new QRCode();

      if (!rows[0]) {
        qrcoderesult.status = '0'
        qrcoderesult.id_portaria_festa_junina = 0
        qrcoderesult.message = ""
        qrcoderesult.check_in = null
        return qrcoderesult;
      } else {
        qrcoderesult.status = '1'
        qrcoderesult.id_portaria_festa_junina = rows[0].id_portaria_festa_junina
        qrcoderesult.check_in = rows[0].check_in
        qrcoderesult.message = ""
        return qrcoderesult;
      }


    } catch (err) {
      console.error(err);
    }
  }

  async findQrCode(qrcode: string): Promise<QRCode> {
    try {
      const connection = await this.getConnection();
      const [rows, fields] = await connection.execute("select * from afpesp.portaria_festa_junina where qrcode= ?", [qrcode])

      const qrcoderesult = new QRCode();

      if (!rows[0]) {
        qrcoderesult.status = '0'
        qrcoderesult.id_portaria_festa_junina = 0
        qrcoderesult.message = ""
        qrcoderesult.check_in = null
        return qrcoderesult;
      } else {
        qrcoderesult.status = '1'
        qrcoderesult.id_portaria_festa_junina = rows[0].id_portaria_festa_junina
        qrcoderesult.check_in = rows[0].check_in
        qrcoderesult.message = ""
        return qrcoderesult;
      }


    } catch (err) {
      console.error(err);
    }
  }

  async findCpf(pCpf: string): Promise<QRCode> {
    try {
      const connection = await this.getConnection();
      const [rows, fields] = await connection.execute("select * from afpesp.portaria_festa_junina where cpf= ?", [pCpf])

      const qrcoderesult = new QRCode();

      if (!rows[0]) {
        qrcoderesult.status = '0'
        qrcoderesult.id_portaria_festa_junina = 0
        qrcoderesult.message = ""
        qrcoderesult.check_in = null
        return qrcoderesult;
      } else {
        qrcoderesult.status = '1'
        qrcoderesult.id_portaria_festa_junina = rows[0].id_portaria_festa_junina
        qrcoderesult.check_in = rows[0].check_in
        qrcoderesult.message = ""
        return qrcoderesult;
      }


    } catch (err) {
      console.error(err);
    }
  }

  async baixaQrcode(id_portaria_festa_junina: number): Promise<Status> {
    const status = new Status();
    const connection = await this.getConnection();
    try {
      await connection.execute("update afpesp.portaria_festa_junina set check_in=now() where id_portaria_festa_junina= ?", [id_portaria_festa_junina])
      //const [rows, fields] = await connection.execute("select * from afpesp.portaria_festa_junina where id_portaria_festa_junina= ?", [id_portaria_festa_junina])
      const [rows, fields] = await connection.execute("select count(1) as qtd_entrada from afpesp.portaria_festa_junina where check_in is not null")

      status.code = 1
      status.message = "Feita baixa QRCode"
      status.qtd_entrada = rows[0].qtd_entrada
      return status;

    } catch (err) {

      status.code = 1
      status.message = "Error ao fazer baixa: " + err
      status.qtd_entrada = 0
      return status;
    }
  }

  async insereIngresso({ id_cupom, ingresso, qrcode, id_estab, id_setor, matricula, nome, idade, nascimento, sexo, parentesco, valor, faixa_idade, cpf, condicao }: DadosIngressos): Promise<void> {

    const connection = await this.getConnection();
    const sql = "insert into afpesp.portaria_festa_junina (id_cupom, ingresso,qrcode, id_estab, id_setor, matricula,nome,idade,nascimento,sexo,Parentesco,valor,faixa_idade,cpf,condicao) values ?"
    const values = [[id_cupom, ingresso, qrcode, id_estab, id_setor, matricula, nome, idade, nascimento, sexo, parentesco, valor, faixa_idade, cpf, condicao]]

    try {
      await connection.query(sql, [values])

    } catch (err) {
      throw new Error('Error:' + err)

    }
  }
}