/**
 * Dados transportados entre as telas de autenticação via `location.state` do React Router.
 * Nada aqui é persistido: ao recarregar a página o fluxo volta ao passo seguro anterior.
 */
export interface AuthLocationState {
  /** E-mail informado no login ou na recuperação de acesso. */
  email?: string;
  /** Token devolvido pela verificação do código, exigido para criar a nova senha. */
  resetToken?: string;
  /** Rota protegida que o usuário tentava acessar antes do login. */
  from?: string;
}
