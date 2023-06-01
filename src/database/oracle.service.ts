/* eslint-disable prettier/prettier */
import { Injectable, OnModuleDestroy } from '@nestjs/common';
import * as oracledb from 'oracledb';
import 'dotenv/config'
import { GetIngresso } from 'src/dtos/GetIngresso';
import { MysqlService } from './mysql.service';
import { DadosIngressos } from 'src/dtos/DadosIngressos';
import { DadosIngressosOracle } from 'src/dtos/DadosIngressosOracle';

@Injectable()
export class OracleService implements OnModuleDestroy {

  private connection: oracledb.Connection

  private isConnected = false


  constructor(private readonly mysqlService: MysqlService) {
    this.connect()
  }
  async connect() {
    if (!this.isConnected) {
      try {
        const connectString = process.env.ORACLE_CONNECT_STRING

        this.connection = await oracledb.getConnection({
          user: process.env.ORACLE_USER,
          password: process.env.ORACLE_PASSWORD,
          connectString: connectString
        });

        this.isConnected = true;
        console.log("Conectado ao oracle " + process.env.ORACLE_CONNECT_STRING)

      } catch (error) {
        console.log(`Erro ao conectar banco oracle ${error}`)
      }
    }
    return this.connection;
  }

  async getConnection(): Promise<oracledb.Connection> {
    if (!this.isConnected) {
      await this.connect();
    }
    try {
      // Tente executar uma consulta simples para verificar a conexão antes de retorná-la
      await this.connection.execute('SELECT 1 FROM DUAL');
    } catch (error) {
      this.isConnected = false;
      await this.connect();
    }
    return this.connection;
  }

  async onModuleDestroy() {
    await this.disconnect()
  }

  private async disconnect() {
    if (this.connection) {
      await this.connection.close();
      this.connection = null;
      this.isConnected = false;
      console.log('[ORACLE] Disconnected from Oracle DB.');
    }
  }
  ////////////////////////////////////////////////////////////
  async checkStatus(): Promise<boolean> {
    try {
      const connection = await this.getConnection();
      await connection.execute('SELECT 1 FROM DUAL');
      return true;
    } catch (error) {
      console.log('[ORACLE] Error checking Oracle DB status.');
      this.isConnected = false;
      await this.connect();
      return false;
    }

  }


  async getIngressos(pEvento: number): Promise<GetIngresso> {

    try {
      const connection = await this.getConnection()

      const result = await connection.execute(
        `BEGIN ERP.PKG_WEB_FESTA_JUNINA.SP_LISTA_PARTICIPANTES(
              :p_evento, 
              :po_retorno,
              :po_msg,
              :po_rs
            ); END;`,
        {
          p_evento: { val: pEvento, type: oracledb.NUMBER, dir: oracledb.BIND_IN },
          po_retorno: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
          po_msg: { type: oracledb.STRING, dir: oracledb.BIND_OUT },
          po_rs: { type: oracledb.CURSOR, dir: oracledb.BIND_OUT },
        },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }

      );

      const listaIngresso: DadosIngressos[] = [];
      let row: string;

      const dados: any = await result.outBinds;

      while ((row = await dados.po_rs.getRow())) {
        const rowData = row as unknown as DadosIngressosOracle;

        const ingressoData: DadosIngressos = {
          id_cupom: rowData.ID_CUPOM,
          id_portaria_festa_junina: 0,
          ingresso: rowData.INGRESSO,
          qrcode: rowData.QRCODE,
          id_estab: rowData.ID_ESTAB,
          id_setor: rowData.ID_SETOR,
          matricula: rowData.MATRICULA,
          nome: rowData.NOME,
          idade: rowData.IDADE,
          nascimento: rowData.NASCIMENTO,
          sexo: rowData.SEXO,
          parentesco: rowData.PARENTESCO,
          check_in: undefined,
          valor: rowData.VALOR,
          sorteio: null,
          faixa_idade: rowData.FAIXA_IDADE,
          cpf: rowData.CPF,
          condicao: rowData.DSC_CONDICAO,
          tempo_afpesp_dias: rowData.TEMPO_AFPESP_DIAS
        }
        listaIngresso.push(ingressoData)
      }

      const resultFormat: GetIngresso = {
        po_retorno: dados.po_retorno,
        po_msg: '',
        po_rs: listaIngresso
      }

      return resultFormat;

    } catch (err) {
      console.log("error" + err)
      const resultFormat: GetIngresso = {
        po_retorno: 2,
        po_msg: err,
        po_rs: [],
      }
      return resultFormat;
    }

  }



}
