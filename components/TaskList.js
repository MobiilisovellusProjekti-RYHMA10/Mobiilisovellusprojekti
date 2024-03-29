import { View, Text, Button } from 'react-native'
import React, { useEffect } from 'react'
import { collection, addDoc } from 'firebase/firestore'
import { firestore } from '../firebase/Config'



export default function TaskList() {
    const [todos, setTodos] = useState([])
    const [todo, setTodo] = useState('')
    
    
    useEffect(() => {}, [])

    const addTodo = async () => {
        console.log('Lisätään tehtävä')
        const doc = addDoc(collection(firestore, 'todos'), {title: 'olen testi2', done: false });
    }


  return (
    <View style={styles.container}>
        <View>
            <TextInput placeholder="Lisää tehtävä" onChangeText={ text => setTodo(text)} value={todo}/>
            <Button onPress={addTodo} title="Lisää" disabled={todo === ''}></Button>
        </View>
    </View>
  )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'lightgrey',
        color: 'black',
        alignItems: 'center',
        justifyContent: 'center',
    }
})