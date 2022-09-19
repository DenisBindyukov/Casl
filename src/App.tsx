import React, {useState} from 'react';
import './App.css';
import uuid from 'react-uuid';
import permissionBuilders, {PermissionGroups} from "./casl/permissionBuilders";
import {AnyMongoAbility, subject} from "@casl/ability";
import {Can} from "@casl/react";


type TodoType = {
    id: string
    title: string
    userName: string
    authorId: string
    isDone: boolean
}

const getUser = (role: PermissionGroups) => {
    return {
        id: `1${role}`,
        role,
        isLoggedIn: false
    }
}

function App() {
    const [user, setUser] = useState(getUser(PermissionGroups.superAdmin));
    const [todos, setTodo] = useState<TodoType[]>([]);
    const [text, setText] = useState('');
    const [userName, setUserName] = useState<PermissionGroups>(PermissionGroups.superAdmin);

    const userAbility: AnyMongoAbility = permissionBuilders(user);

    const authorization = (id: string) => {
        setUser(user => user.id === id ? {...user, isLoggedIn: !user.isLoggedIn} : user);
    }

    const setNewUser = (userName: PermissionGroups) => {
        setUserName(userName);
        setUser(getUser(userName));
    }

    const changeChecked = (id: string, value: boolean) => {
        setTodo(state => state.map(el => el.id === id ? {...el, isDone: value} : el));
    }

    const updateTitle = (id: string, title: string) => {
        setTodo(state => state.map(el => el.id === id ? {...el, title: title} : el));

    }

    const deleteTodo = (id: string) => {
        setTodo(state => state.filter(el => el.id !== id));

    }

    const addTodo = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.keyCode !== 13) {
            return;
        }

        const newTodos: TodoType = {
            id: uuid(),
            isDone: false,
            title: text,
            userName: user.role,
            authorId: user.id
        }
        setTodo([newTodos, ...todos]);
        setText('');
    }


    const todosFC = todos.map((el) => <Todo key={el.id}
                                            userAbility={userAbility}
                                            deleteTodo={deleteTodo}
                                            todo={el}
                                            updateTitle={updateTitle}
                                            changeChecked={changeChecked}/>)

    console.log('todos', todos)

    return (
        <div className="App">
            <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                <h1 style={{margin: '10px 10px'}}>Todos</h1>
                {
                    !user.isLoggedIn
                        ? <button onClick={() => authorization(user.id)}
                                  style={{width: '3%', height: '10%'}}>Login</button>
                        : <button onClick={() => authorization(user.id)} style={{width: '3%', height: '10%'}}>Log
                            out</button>
                }
            </div>

            <div style={{paddingTop: '20px'}}>

                <Can I={'create'} this={'Todo'} ability={userAbility}>
                    <input type="text"
                           onKeyUp={addTodo}
                        // disabled={!userAbility.can('create', 'Todo')}
                           value={text} onChange={(e) => setText(e.currentTarget.value)}/>
                </Can>

                <select name="users"
                        value={userName}
                        onChange={(e) => setNewUser(e.currentTarget.value as PermissionGroups)}
                        style={{marginLeft: '10px'}}>
                    <option value="superAdmin">superAdmin</option>
                    <option value="admin">admin</option>
                    <option value="user">user</option>
                </select>
            </div>
            {todosFC}
        </div>
    );
}

type TodosType = {
    userAbility: AnyMongoAbility
    todo: TodoType
    changeChecked: (id: string, value: boolean) => void
    updateTitle: (id: string, title: string) => void
    deleteTodo: (id: string) => void
}
const Todo = (props: TodosType) => {
    const [updateToggle, setUpdateToggle] = useState(false);

    const setUpdateToggleHandler = () => {
        if (!props.userAbility.can('update', subject('Todo', props.todo))) return
        setUpdateToggle(state => !state)
    }

    console.log(props.userAbility.can('update', subject('Todo', props.todo)))

    return <div style={{padding: '20px', display: 'flex', justifyContent: 'center'}}>
        <Can I={'update'} this={subject('Todo', props.todo)} ability={props.userAbility}>
            <input
                type="checkbox"
                checked={props.todo.isDone}
                onChange={(e) => props.changeChecked(props.todo.id, e.currentTarget.checked)}
            />
        </Can>

        {
            updateToggle
                ?

                <input type={'text'}
                       value={props.todo.title}
                       onBlur={() => setUpdateToggle(state => !state)}
                       onChange={(e) => props.updateTitle(props.todo.id, e.currentTarget.value)}/>

                :

                <span style={props.todo.isDone ? {
                    paddingRight: '40px',
                    textDecoration: 'line-through'
                } : {paddingRight: '40px'}}
                      onDoubleClick={() => setUpdateToggleHandler()}>
                    {props.todo.title}
                </span>
        }
        <div style={{paddingLeft: '10px'}}>user: {props.todo.userName}</div>

        <Can do={'delete'} a={subject('Todo', props.todo)} ability={props.userAbility}>
            <button
                style={{marginLeft: '10px'}}
                onClick={() => props.deleteTodo(props.todo.id)}
            >DELETE
            </button>
        </Can>

    </div>
}
export default App;
