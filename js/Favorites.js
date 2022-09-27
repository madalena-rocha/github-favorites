import { GithubUser } from "./GithubUser.js"

// classe contendo a lógica de como os dados serão estruturados na tabela
export class Favorites {
    constructor(root) {
        this.root = document.querySelector(root) // passando o root que deseja utilizar
        this.load()
    }

    load() {
        this.entries = JSON.parse(localStorage.getItem('@github-favorites:')) || []
        /*
            - o parse vai modificar um JSON para o objeto que está dentro do JSON
            - || [] para garantir que o entries seja um array
            - o entries será carregado no momento que for passado o app para dentro da FavoritesView
            - vai no super, cria o root, entra no this.root da Favorites, passa o root e carrega os dados
            - o this.entries existe a partir da linha do super
        */
    }

    save() {
        localStorage.setItem('@github-favorites:', JSON.stringify(this.entries))
        // JSON.stringify vai transformar um objeto que está no JS para um objeto tipo JSON em string
    }

    async add(username) {
        try {
            // Higher-order functions (map, filter, find, reduce) recebem funções como argumento ou retornam funções como argumento
            // respeitam o princípio da imutabilidade da programação funcional
            const userExists = this.entries.find(entry => entry.login === username)
            // se encontrar o user, retorna verdadeiro, pega a entrada e devolve como um objeto no userExists

            if(userExists) {
                throw new Error('Usuário já cadastrado')
            }

            const user = await GithubUser.search(username)

            if(user.login === undefined) {
                throw new Error('Usuário não encontrado!')
            }

            this.entries = [user, ...this.entries]
            /*
                - this.entries recebe um novo array
                - adiciona ao novo array o user e traz de volta espalhando as entries que haviam antes
                - primeiro vai colocar no entries o usuário buscado do github e todos os outros virão abaixo dele
            */
            this.update()
            this.save()

        } catch(error) {
            alert(error.message)
        }
    }

    delete(user) {
        const filteredEntries = this.entries
            .filter(entry => entry.login !== user.login)
            /*
                - o filter vai rodar uma função para cada entrada e retornar um novo array
                - se a função que está sendo rodada para o elemento retornar true, coloca os elementos no array, retornando as entradas
                - se retornar false, o elemento é removido e não fará mais parte da função, retornando um array vazio
                - se entry.login for diferente de user.login (verdadeiro), mantém no entry, se não for diferente (falso), retira do array
                - this.entries.filter retorna todos os usuários do this.entries, exceto o que está sendo passado no filter
            */

        this.entries = filteredEntries
        this.update()
        this.save()
    }
}

// classe para criar a visualização e eventos do HTML (construir a tabela)
export class FavoritesView extends Favorites {
    constructor(root) {
        super(root)
        /*
            - ao chamar o super, o root passado no constructor da FavoritesView vai para dentro do constructor da Favorites, criando o this.root e buscando o root
            - o this.root vai existir tanto para a classe Favorites quanto para a FavoritesView
            - o constructor da FavoritesView recebe o app, passa para o super, chama o constructor da Favorites, passando para ele o app, procura o app e coloca no this.root
        */

        this.tbody = this.root.querySelector('table tbody')

        this.update()
        this.onadd()
    }

    onadd() {
        const addButton = this.root.querySelector('.search button')

        addButton.onclick = () => {
            const { value } = this.root.querySelector('.search input')

            this.add(value)
        }
    }

    update() {
        // o primeiro passo ao atualizar a listagem é remover os elementos
        this.removeAllTr()
        
        // o segundo passo é recriar cada coluna do HTML diretamente
        this.entries.forEach( user => {
            /*
                - forEach recebe uma função como argumento, que será executada para cada elemento
                - já tem o mapeamento dos objetos necessários, agora é necessário colocar os objetos no HTML em cada row
            */
            const row = this.createRow()

            row.querySelector('.user img').src = `https://github.com/${user.login}.png`
            row.querySelector('.user img').alt = `Imagem de ${user.name}`
            row.querySelector('.user a').href = `https://github.com/${user.login}`
            row.querySelector('.user p').textContent = user.name
            row.querySelector('.user span').textContent = user.login
            row.querySelector('.repositories').textContent = user.public_repos
            row.querySelector('.followers').textContent = user.followers

            row.querySelector('.remove').onclick = () => {
                const isOK = confirm('Tem certeza que deseja deletar essa linha?')

                if(isOK) {
                    this.delete(user)
                }
            }

            this.tbody.append(row) // recebe um elemento HTML da DOM
        })
    }

    createRow() {
        const tr = document.createElement('tr') // o tr precisa ser criado pela DOM
        
        tr.innerHTML = `
            <td class="user">
                <img src="https://github.com/madalena-rocha.png" alt="Imagem de madalena-rocha">
                <a href="https://github.com/madalena-rocha" target="_blank">
                    <p>Madalena Rocha</p>
                    <span>madalena-rocha</span>
                </a>
            </td>
            <td class="repositories">37</td>
            <td class="followers">277</td>
            <td>
                <button class="remove">&times;</button>
            </td>
        `

        return tr
    }

    removeAllTr() {        
        this.tbody.querySelectorAll('tr')
            .forEach((tr) => {
                tr.remove()
            })
    }
}