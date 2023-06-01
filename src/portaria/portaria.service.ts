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
        message: "Não existem ingressos para migração",
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
        tempo_afpesp_dias: ingresso.tempo_afpesp_dias
      }

      //verifica se o qrcode ja existe

      const resultQrCOde = await this.mySqlService.findQrCode(dados.qrcode);

      if (resultQrCOde.status === "0") {
        await this.mySqlService.insereIngresso(dados)
        pCt++
      }
    }


    const status: Status = {
      message: "Migração finalizada",
      code: 1,
      qtd_entrada: pCt
    }
    return status


  }

  async ingressoConsultaBaixa(pIngresso: string) {
    const result = await this.mySqlService.findIngresso(pIngresso);

    if (!result.status || result.status === '0') {
      const status: Status = {
        message: "Ingresso inválido",
        code: 2,
        qtd_entrada: 0
      }
      return status
    }

    if (result.check_in) {
      const status: Status = {
        message: "Ingresso já foi utilizado",
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
        message: "QRCode inválido",
        code: 2,
        qtd_entrada: 0
      }
      return status
    }

    if (result.check_in) {
      const status: Status = {
        message: "QRCode já foi utilizado",
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

    const mySql = 'SELECT * FROM portaria_festa_junina  where Matricula = ' + pMatricula + ' order by check_in,nome'

    //const result = await this.portariaRepository.getMatricula(pMatricula);
    const result = await this.mySqlService.getLista(mySql);
    return result
  }

  async cpfConsultaBaixa(pCpf: string): Promise<Status> {

    const result = await this.mySqlService.findCpf(pCpf);

    if (!result.status || result.status === '0') {
      const status: Status = {
        message: "CPF não encontrado",
        code: 2,
        qtd_entrada: 0
      }
      return status
    }

    if (result.check_in) {
      const status: Status = {
        message: "CPF já foi utilizado",
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


  async clear_base(): Promise<void> {
    const mySql = 'delete from portaria_festa_junina'
    await this.mySqlService.delete(mySql);
  }


  async sorteio() {

    const connection = await this.mySqlService.connect();
    const [rows]: any = await connection.query('SELECT nome, cpf, id_portaria_festa_junina FROM portaria_festa_junina WHERE sorteio IS NULL AND check_in IS NOT NULL ORDER BY RAND() LIMIT 1');
    const user = rows[0]?.nome;
    const cpf = rows[0]?.cpf;
    const id_portaria_festa_junina = rows[0]?.id_portaria_festa_junina;
    if (user) {
      await connection.query('UPDATE portaria_festa_junina SET sorteio = 1, data_sorteio = now() WHERE id_portaria_festa_junina = ?', [id_portaria_festa_junina]);
    }
    //await connection.end();

    return { "nome": user, "cpf": cpf };
  }


  async sorteados() {
    const mySql = `SELECT * FROM portaria_festa_junina where sorteio = 1 order by data_sorteio`;
    const result = await this.mySqlService.getLista(mySql);
    return result;
  }

  async listaPresentes(): Promise<GetIngresso> {
    const mySql = "SELECT * FROM portaria_festa_junina  where check_in is not null order by check_in"
    const result = await this.mySqlService.getLista(mySql);
    return result
  }

  async aniversariantes(pData: string): Promise<GetIngresso> {
    const mySql = `SELECT * FROM portaria_festa_junina WHERE check_in IS NOT NULL AND DATE_FORMAT(nascimento, '%m%d') = ?`;
    const result = await this.mySqlService.getLista(mySql, [pData]);
    return result;
  }

  async relatorios() {

    const result = [];

    //posicao 0 Socio que comprou o primeiro ingresso
    const primeiroIngresso = "SELECT nome,cpf FROM `portaria_festa_junina` ORDER BY id_portaria_festa_junina ASC LIMIT 10";
    const resultPrimeiroIngresso = await this.mySqlService.getRelatorios(primeiroIngresso);
    result.push(resultPrimeiroIngresso);

    //posicao 1 aniversariantes que estão presentes
    const aniversariantesDoDia = "SELECT nome,cpf FROM `portaria_festa_junina` WHERE where  `check_in` IS NOT NULL and  DAY(`nascimento`) = DAY(CURDATE()) AND MONTH(`nascimento`) = MONTH(CURDATE());";
    const resultAniversariantesDoDia = await this.mySqlService.getRelatorios(aniversariantesDoDia);
    result.push(resultAniversariantesDoDia);

    //posicao 2 Visistante presente de menor idade
    const visitanteMenorIdade = "SELECT nome,idade,cpf FROM `portaria_festa_junina` where  `check_in` IS NOT NULL ORDER BY `idade` ASC LIMIT 10;";
    const resultVisitanteMenorIdade = await this.mySqlService.getRelatorios(visitanteMenorIdade);
    result.push(resultVisitanteMenorIdade);

    //posicao 3 Visistante presente de maior idade
    const visitanteMaiorIdade = "SELECT nome,idade,cpf FROM portaria_festa_junina where  check_in IS NOT NULL ORDER BY idade DESC LIMIT 10;";
    const resultVisitanteMaiorIdade = await this.mySqlService.getRelatorios(visitanteMaiorIdade);
    result.push(resultVisitanteMaiorIdade);

    //posicao 4 Primeira pessoa que entrou no evento
    const visitantePrimeiroNoEvento = "SELECT nome,cpf FROM `portaria_festa_junina`WHERE `check_in` IS NOT NULL ORDER BY `check_in` ASC LIMIT 10;  ";
    const resultVisitantePrimeiroNoEvento = await this.mySqlService.getRelatorios(visitantePrimeiroNoEvento);
    result.push(resultVisitantePrimeiroNoEvento);

    //posicao 5
    const totalEntrantes = "SELECT COUNT(*) as total FROM `portaria_festa_junina` WHERE `check_in` IS NOT NULL;";
    const resultTotalEntrantes = await this.mySqlService.getTotal(totalEntrantes);
    result.push([resultTotalEntrantes]);

    //posicao 6
    const sorteador = "SELECT nome, cpf FROM `portaria_festa_junina` WHERE `sorteio` IS NOT NULL order by sorteio;";
    const resultSorteados = await this.mySqlService.getRelatorios(sorteador);
    result.push(resultSorteados);

    //posicao 7 socios com maior tempo de afpesp
    const maior_tempo_afpeps = "SELECT nome, cpf FROM `portaria_festa_junina` WHERE `check_in` IS NOT NULL order by TEMPO_AFPESP_DIAS DESC LIMIT 10;";
    const resultMaiorTempoAfpesp = await this.mySqlService.getRelatorios(maior_tempo_afpeps);
    result.push(resultMaiorTempoAfpesp);


    return result;
  }


}

