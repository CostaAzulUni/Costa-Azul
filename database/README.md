# Projeto Costa Azul — Documentação do Banco de Dados (DER v2.3)

Este repositório contém a modelagem de dados e a arquitetura do banco de dados relacional para o sistema **Costa Azul**.

---

## 📌 Visão Geral

A modelagem de dados (versão 2.3) foi projetada para suportar a gestão completa de usuários, controle de acesso refinado (RBAC), gestão de passageiros, funcionários, departamentos e preferências do sistema. 

### Destaques da Versão 2.3
- **Padronização de Nomes:** Correções de nomenclatura em 7 esquemas.
- **Auditoria:** Colunas padrão de auditoria (`created_at`, `updated_at`) em todas as tabelas.
- **Booleans:** Prefixos consistentes para colunas do tipo verdadeiro/falso (ex: `is_primary`, `is_notifications_enabled`).
- **Ajustes de Domínio:** Refinamento dos tipos de dados para regras de negócio específicas.

---

## 🗄️ Estrutura das Tabelas

\icador se a conta está ativa.
- `version` - Controle de versão para concorrência otimista.
- `created_at` / `updated_at` - Colunas de auditoria.

#### `USER_ROLE` *(Nova na v2.1)*
Tabela associativa que implementa a relação N:N (Muitos para Muitos) entre Usuários (`ACCOUNT`) e Papéis (`ROLE`).

---

#### `ROLE`
Define os papéis ou perfis de acesso dentro do sistema (ex: *Admin*, *Passenger*, *Employee*).

---


#### `USER_PHONE`
Armazena os números de telefone associados a cada usuário (suporta múltiplos números por conta).

---

### 2. Perfis de Negócio (Especializações)

#### `PASSENGER`
Extensão de perfil para usuários que atuam como passageiros no sistema.

#### `EMPLOYEES`
Extensão de perfil para usuários que são colaboradores/funcionários da organização.

---

### 3. Estrutura Organizacional

#### `DEPARTMENT`
Setores ou departamentos da organização.

#### `JOB_POSITION` *(Renomeada na v2.2)*
Cargos e posições hierárquicas disponíveis na empresa.

---

### 4. Configurações e Logs de Acesso

#### `PREFERENCES`
Armazena configurações personalizadas da aplicação para cada usuário.

#### `USER_ACCESS_LOG`
Registra os eventos de autenticação e acessos para auditoria e segurança.

---


## 🛠️ Boas Práticas Implementadas

1. **Rastreabilidade (Audit Trail):** Todas as entidades principais contêm `created_at` e `updated_at` no formato `timestamp`.
2. **Normalização:** Separação de contatos telefônicos (`USER_PHONE`) e permissões (`USER_ROLE`) para evitar redundância.
3. **Padrão de Nomeclatura:** Prefixos booleanos claros (`is_`) em todo o esquema.
---

