import { Injectable } from "@nestjs/common"
import { MysqlService } from "src/database/mysql.service";
import { OracleService } from "src/database/oracle.service";
import { DadosIngressos } from "src/dtos/DadosIngressos";
import { GetIngresso } from "src/dtos/GetIngresso";
import { Status } from "src/dtos/Status";

@Injectable()
export class PortariaServices {
  constructor(
    private readonly oracleService: OracleService,
    private readonly mySqlService: MysqlService,
  ) { }

  async importaIngresso(pEvento: number) {
    const result = await this.oracleService.getIngressos(pEvento)
    if (result.po_retorno === 2 || result === null) {
      const status: Status = {
        message: "Não há ingresso para migrar!",
        code: 2,
        qtd_entrada: 0
      }
      return status
    }


    let pCt = 0
    for (const ingresso of result.po_rs) {

      const dados: DadosIngressos = {
        id_cupom: ingresso.id_cupom,
        ingresso: ingresso.ingresso,
        qrcode: ingresso.qrcode,
        id_estab: ingresso.id_estab,
        id_setor: ingresso.id_setor,
        matricula: ingresso.matricula,
        nome: ingresso.nome,
        idade: ingresso.idade,
        nascimento: ingresso.nascimento,
        sexo: ingresso.sexo,
        parentesco: ingresso.parentesco,
        valor: ingresso.valor,
        id_portaria_festa_junina: 0,
        check_in: undefined,
        sorteio: null,
        faixa_idade: ingresso.faixa_idade,
        cpf: ingresso.cpf,
        condicao: ingresso.condicao,
      }

      //verifica se o qrcode ja existe

      const resultQrCOde = await this.mySqlService.findQrCode(dados.qrcode);

      if (resultQrCOde.status === "0") {
        await this.mySqlService.insereIngresso(dados)
        pCt++
      }
    }


    const status: Status = {
      message: "Migração finalizada!",
      code: 1,
      qtd_entrada: pCt
    }
    return status


  }

  async ingressoConsultaBaixa(pIngresso: string) {
    const result = await this.mySqlService.findIngresso(pIngresso);

    if (!result.status || result.status === '0') {
      const status: Status = {
        message: "Ingresso invalido",
        code: 2,
        qtd_entrada: 0
      }
      return status
    }

    if (result.check_in) {
      const status: Status = {
        message: "Ingresso já baixado",
        code: 2,
        qtd_entrada: 0
      }
      return status
    }

    if (!result.check_in) {
      const status = await this.mySqlService.baixaQrcode(result.id_portaria_festa_junina);
      return status;
    }

  }

  async qrCodeConsultaBaixa(qrcode: string): Promise<Status> {

    const result = await this.mySqlService.findQrCode(qrcode);

    if (!result.status || result.status === '0') {
      const status: Status = {
        message: "QrCode invalido",
        code: 2,
        qtd_entrada: 0
      }
      return status
    }

    if (result.check_in) {
      const status: Status = {
        message: "QrCode já baixado",
        code: 2,
        qtd_entrada: 0
      }
      return status
    }

    if (!result.check_in) {
      const status = await this.mySqlService.baixaQrcode(result.id_portaria_festa_junina);

      return status;
    }

  }

  async matriculaConsulta(pMatricula: number): Promise<GetIngresso> {

    const mySql = 'SELECT * FROM afpesp.portaria_festa_junina  where Matricula = ' + pMatricula + ' order by check_in,nome'

    //const result = await this.portariaRepository.getMatricula(pMatricula);
    const result = await this.mySqlService.getLista(mySql);
    return result
  }

  async cpfConsultaBaixa(pCpf: string): Promise<Status> {

    const result = await this.mySqlService.findCpf(pCpf);

    if (!result.status || result.status === '0') {
      const status: Status = {
        message: "Cpf não encontrado",
        code: 2,
        qtd_entrada: 0
      }
      return status
    }

    if (result.check_in) {
      const status: Status = {
        message: "Cpf já baixado",
        code: 2,
        qtd_entrada: 0
      }
      return status
    }

    if (!result.check_in) {
      const status = await this.mySqlService.baixaQrcode(result.id_portaria_festa_junina);

      return status;
    }
  }

  async listaPresentes(): Promise<GetIngresso> {
    const mySql = "SELECT * FROM afpesp.portaria_festa_junina  where check_in is not null order by check_in"

    const result = await this.mySqlService.getLista(mySql);

    return result
  }

  async clear_base(): Promise<void> {

    const mySql = 'delete from afpesp.portaria_festa_junina'

    //const result = await this.portariaRepository.getMatricula(pMatricula);
    await this.mySqlService.delete(mySql);

  }
}

