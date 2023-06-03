// settings
const unit_num = 2
const unit_num_p = 0.8
const board_width = 4
const board_height = 4
const board_grid_size = 100
const board_line_width = 1.5


Array.prototype.sample = function(){
    return this[Math.floor(Math.random()*this.length)];
}

Array.prototype.all_equal = function(){
    for (let i=0; i<this.length-1; i++){
        if (this[i] !== this[i+1]){
            return false
        }
    }
    return true
}

function getMousePos(canvas, event) {
    let rect = canvas.getBoundingClientRect();
    return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
    };
}

function isInside(pos, rect) {
    return pos.x > rect.x & pos.x < rect.x + rect.width & pos.y < rect.y + rect.height & pos.y > rect.y
}

function create_new_squares(row, col){
    let new_squares = new Array(row)
    for (let i=0; i<row; i++){
        new_squares[i] = new Array(col)
    }
    return new_squares
}

function getBaseLog(x, y) {
    return Math.log(y) / Math.log(x);
  }

function rgb2code(r, g, b){
    return `#${r.toString(16)}${g.toString(16)}${b.toString(16)}`
}

let square_color = {
    1: [238, 229, 221],
    2: [233, 225, 205],
    3: [233, 179, 130],
    4: [222, 146, 91],
    5: [232, 130, 105],
    6: [218, 97, 68],
    7: [239, 217, 124],
    8: [236, 209, 100],
    9: [225, 194, 77],
    10: [228, 199, 66],
    11: [233, 197, 86],
    12: [106, 205, 100],
    13: [123, 188, 58],
    14: [116, 183, 54],
    15: [105, 165, 48],
}

let canvas = document.getElementById('canvas')
let ctx = canvas.getContext('2d')

canvas.width = window.innerWidth * 0.99
canvas.height = window.innerHeight * 0.975

ctx.textAlign = 'center'
ctx.textBaseline = 'middle'
ctx.font = "bold 36px gothic"
ctx.lineWidth = board_line_width

class Board {
    constructor(unit_num, unit_num_p, width, height, grid_size, line_width, center_alignment=true) {
        this.unit_num = unit_num
        this.unit_num_p = unit_num_p
        this.width = width
        this.height = height
        this.grid_size = grid_size
        this.line_width = line_width
        this.center_x = center_alignment ? canvas.width / 2 : this.width * this.grid_size / 2
        this.center_y = center_alignment ? canvas.height / 2 : this.height * this.grid_size / 2
        this.squares = create_new_squares(this.height, this.width)
        this.score = 0
    }

    draw(){
        for (let row=0; row<this.height; row++){
            for (let col=0; col<this.width; col++){
                let x = this.center_x + (col - this.width / 2) * this.grid_size
                let y = this.center_y + (row - this.height / 2) * this.grid_size

                let num = this.squares[row][col]
                if (typeof(num) === 'number') {
                    let exp = Math.round(getBaseLog(this.unit_num, num))
                    ctx.fillStyle = rgb2code(...square_color[exp])
                    ctx.fillRect(x, y, this.grid_size, this.grid_size)

                    ctx.fillStyle = exp >= 3 ? 'white' : '#6C5B5C'
                    ctx.fillText(num, x + this.grid_size * 0.5, y + this.grid_size * 0.55)
                } else {
                    ctx.fillStyle = '#C7C7C7'
                    ctx.fillRect(x, y, this.grid_size, this.grid_size)
                }
                ctx.strokeStyle = '#202020'
                ctx.lineWidth = this.line_width
                ctx.strokeRect(x, y, this.grid_size, this.grid_size)
            }
        }
        ctx.fillStyle = '#6C5B5C'
        ctx.fillText('Score', canvas.width / 2, 50)
        ctx.fillText(this.score, canvas.width / 2, 110)
    }

    create(){
        // 생성위치 뽑기
        let locations = []
        for (let row=0; row<this.height; row++){
            for (let col=0; col<this.width; col++){
                if (typeof(this.squares[row][col]) !== 'number'){
                    locations.push([row, col])
                }
            }
        }
        let target_loc = locations.sample()
        
        // 생성 숫자 뽑기
        let created_number = this.unit_num
        if (Math.random() > this.unit_num_p){
            created_number = this.unit_num ** 2
        }
        // 생성
        this.squares[target_loc[0]][target_loc[1]] = created_number
    }

    can_move(){
        for (let row=0; row<this.height; row++){
            for (let col=0; col<this.width; col++){
                // 빈칸 있으면 return true
                if (typeof(this.squares[row][col]) !== 'number') return true
                // 상하 방향 병합 되는지 확인
                if (row + this.unit_num <= this.height){
                    let merge = true
                    for (let i=1; i<this.unit_num; i++){
                        // 빈칸 있으면 return true
                        if (typeof(this.squares[row+i][col]) !== 'number') return true
                        // 다른거 발견되면 중단하고 break
                        if (this.squares[row+i][col] !== this.squares[row+i-1][col]){
                            merge = false
                            break
                        }
                    }
                    if (merge) return true
                }
                // 좌우 방향 병합 되는지 확인
                if (col + this.unit_num <= this.width){
                    let merge = true
                    for (let i=1; i<this.unit_num; i++){
                        // 빈칸 있으면 return true
                        if (typeof(this.squares[row][col+i]) !== 'number') return true
                        // 다른거 발견되면 중단하고 break
                        if (this.squares[row][col+i] !== this.squares[row][col+i-1]){
                            merge = false
                            break
                        }
                    }
                    if (merge) return true
                }
            }
        }
        return false
    }

    rotate90(clockwise=true){
        // 새로운 빈 보드 생성(회전의 결과 기록용)
        let new_squares = create_new_squares(this.width, this.height)
        
        for (let row=0; row<this.width; row++){
            for (let col=0; col<this.height; col++){
                let row_old = clockwise ? this.height - 1 - col : col
                let col_old = clockwise ? row : this.width - 1 - row
                new_squares[row][col] = this.squares[row_old][col_old]
            }
        }
        this.squares = new_squares

        let temp = this.width
        this.width = this.height
        this.height = temp
    }

    horizental_flip(){
        let new_squares = create_new_squares(this.height, this.width)

        for (let row=0; row<this.height; row++){
            for (let col=0; col<this.width; col++){
                new_squares[row][col] = this.squares[row][this.width - 1 - col]
            }
        }
        this.squares = new_squares
    }

    left(){
        let move = false

        let old_board = this.squares
        let new_board = create_new_squares(this.height, this.width)

        // 중간에 끼어있는 빈칸 없애기
        for (let row=0; row<this.height; row++){
            let cursor = 0
            for (let col=0; col<this.width; col++){
                if (typeof(old_board[row][col]) === 'number'){
                    let temp = old_board[row][cursor]
                    old_board[row][cursor] = old_board[row][col]
                    old_board[row][col] = temp

                    if (col !== cursor){
                        move = true
                    }
                    cursor++
                }
            }
        }

        let score = 0
        
        // merge
        for (let row=0; row<this.height; row++){
            let old_cursor = 0
            let new_cursor = 0
            while (typeof(old_board[row][old_cursor]) === 'number'){
                // merge!
                if (old_cursor + this.unit_num <= this.width
                        & old_board[row].slice(old_cursor, old_cursor + this.unit_num).all_equal()){
                    new_board[row][new_cursor] = old_board[row][old_cursor] * this.unit_num
                    score += new_board[row][new_cursor]
                    new_cursor++
                    old_cursor += this.unit_num
                    
                    move = true
                    
                }
                // not merge
                else {
                    new_board[row][new_cursor] = old_board[row][old_cursor]
                    new_cursor++
                    old_cursor++
                }
            }
        }
        this.squares = new_board
        return [move, score]
    }

    right(){
        this.horizental_flip()
        let [move, score] = this.left()
        this.horizental_flip()
        return [move, score]
    }

    up(){
        this.rotate90(false)
        let [move, score] = this.left()
        this.rotate90(true)
        return [move, score]
    }

    down(){
        this.rotate90(true)
        let [move, score] = this.left()
        this.rotate90(false)
        return [move, score]
    }

    move(direction){
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.fillStyle = '#eeeeee'
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        let [move, score] = [false, 0]
        if (direction === 'left'){
            [move, score] = this.left()
        } else if (direction === 'right'){
            [move, score] = this.right()
        } else if (direction === 'up'){
            [move, score] = this.up()
        } else if (direction === 'down'){
            [move, score] = this.down()
        }
        
        this.score += score

        if (move){
            this.create()
        }
        board.draw()
        
        if (!move & !this.can_move()){
            this.game_over()
        }
        
    }

    handle_keydown(e){
        if (e.code === 'ArrowLeft'){
            board.move('left')
        } else if (e.code === 'ArrowRight'){
            board.move('right')
        } else if (e.code === 'ArrowUp'){
            board.move('up')
        } else if (e.code === 'ArrowDown'){
            board.move('down')
        }
    }

    onkey(){
        document.addEventListener('keydown', this.handle_keydown)
    }

    offkey(){
        document.removeEventListener('keydown', this.handle_keydown)
    }

    clear(){
        this.squares = create_new_squares(this.height, this.width)
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.fillStyle = '#eeeeee'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
    }

    start(){
        this.clear()
        this.create()
        this.draw()
        this.onkey()
    }

    handle_click = (e)=>{
        let mousePos = getMousePos(canvas, e)
        if (isInside(mousePos, this.restart_button)){
            this.start()
            document.removeEventListener('click', this.handle_click, false)
        }
    }

    activate_restart_button(){
        ctx.fillStyle = 'white'
        ctx.fillText('Restart', this.center_x, this.center_y + 53)

        let button_width = 140
        let button_height = 60
        
        // define restart_button
        let restart_button = {
            text: 'Restart',
            x: this.center_x - button_width * 0.5,
            y: this.center_y + 50 - button_height * 0.5,
            width: button_width,
            height: button_height,
        }
        this.restart_button = restart_button
        // draw
        ctx.strokeStyle = 'white'
        ctx.lineWidth = 3
        ctx.strokeRect(restart_button.x, restart_button.y, restart_button.width, restart_button.height)

        // event listener
        document.addEventListener('click', this.handle_click, false)
    }

    game_over(){
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
        ctx.fillRect(this.center_x - 0.5 * this.width * this.grid_size,
                    this.center_y - 0.5 * this.height * this.grid_size,
                    this.width * this.grid_size,
                    this.height * this.grid_size)
        ctx.fillStyle = 'white'
        ctx.fillText('Game Over', this.center_x, this.center_y - 50)
        this.activate_restart_button()
        this.offkey()
    }
}

let board = new Board(unit_num, unit_num_p, board_width, board_height, board_grid_size, board_line_width)
board.start()