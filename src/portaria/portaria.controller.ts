import { Body, Controller, Get, Post } from "@nestjs/common";
import { PortariaServices } from "./portaria.service";

@Controller('portaria')
export class PortariaController {

  constructor(private readonly PortariaService: PortariaServices) { }

  // Importa os ingressos do Oracle para o Mysql
  // Sempre informar o evento, porque muda a cada ano.
  // No caso digitamos pEvento=6 para desenvolvimento e pEvento=9 em produção, porque esse ano é 9 (2023)
  @Post("importaoracleparamysql")
  async importaIngresso(@Body('pEvento') pEvento: string) {
    return await this.PortariaService.importaIngresso(Number(pEvento))
  }

  // Consulta o ingresso pelo código de barras e realiza a baixa.
  @Post("ingresso")
  async ingresso(@Body('pIngresso') pIngresso: string) {
    return await this.PortariaService.ingressoConsultaBaixa(pIngresso)
  }

  // Consulta o ingresso pelo código de barras  e realiza a baixa.
  @Post("qrcode")
  async qrcode(@Body('pQRCODE') pQRCODE: string) {
    return await this.PortariaService.qrCodeConsultaBaixa(pQRCODE)
  }

  // Consulta o ingresso pelo cpf e realiza a baixa.
  @Post("cpf")
  async cpf(@Body('pCpf') pCpf: string) {
    return await this.PortariaService.cpfConsultaBaixa(pCpf)
  }

  // Consulta o ingresso pelo código da matricula, apenas consulta.
  @Post("matricula")
  async matricula(@Body('pMatricula') pMatricula: string) {
    return await this.PortariaService.matriculaConsulta(Number(pMatricula))
  }

  // Retorna a lista de aniversariantes do dia.
  @Post("aniversariantes")
  async aniversariantes(@Body('pData') pData: string) {
    const [dia, mes,] = pData.split('/');
    return await this.PortariaService.aniversariantes(`${mes}${dia}`);
  }

  // Retorna do banco de dados mysql a lista de usuarios que estão presentes no evento por ordem de entrada.
  @Get("listapresentes")
  async listaPresentes() {
    return await this.PortariaService.listaPresentes() 
  }

  //Limpa o banco de dados mysql, ou seja, remove toda a lista de usuarios existentes.
  @Get("limpadbmysql")
  async clear_base() {
    return await this.PortariaService.clear_base()
  }

  @Get("sorteio")
  async sorteio() {
    return await this.PortariaService.sorteio()
  }

  @Get("sorteados")
  async sorteados() {
    return await this.PortariaService.sorteados()
  }

  @Get("relatorios")
  async relatorios() {
    return await this.PortariaService.relatorios()
  }


}