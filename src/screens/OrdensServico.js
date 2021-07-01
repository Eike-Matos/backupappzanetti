import React, { Component } from 'react'
import { 
    View,
    Text, 
    ImageBackground, 
    StyleSheet, 
    FlatList, 
    TouchableOpacity, 
    Platform,
    Alert
} from 'react-native'


import moment from 'moment'
import 'moment/locale/pt-br'
import commonStyles from '../commonStyles.js'
import Ordem from '../components/Ordem'
import AddOrdem from './AddOrdem'

import todayImage from '../../assets/imgs/today.jpg'
import Icon from 'react-native-vector-icons/FontAwesome'

export default class OrdensServico extends Component {

    state = {
        showDoneOrdens: true,
        showAddOrdem: false,
        visibleOrdens: [],
        ordens: [{
            id: Math.random(),
            desc: 'Atendimento OS 123',
            estimateAt: new Date(),
            doneAt: new Date(),
        },{
            id: Math.random(),
            desc: 'Atendimento OS 122',
            estimateAt: new Date(),
            doneAt: null,        
        }]
    }

    /*componentDidMount = () => {
        this.filterOrdens()
    }*/

    toggleFilter = () => {
        this.setState({ showDoneOrdens: !this.state.showDoneOrdens }, this.filterOrdens)
    }

    filterOrdens = () => {
        let visibleOrdens = null 
        if(this.state.showDoneOrdens) {
            visibleOrdens = [...this.state.ordens]
        } else {
            const pending = ordem => ordem.doneAt === null
            visibleOrdens = this.state.ordens.filter(pending)
        }

        this.setState({ visibleOrdens })
    }

    toggleOrdem = ordemId => {
        const ordens = [...this.state.ordens]
        ordens.forEach(ordem => {
            if(ordem.id === ordemId) {
                ordem.doneAt = ordem.doneAt ? null : new Date()
            }
        })
        
        this.setState({ ordens }, this.filterOrdens)
    }

    addOrdem = newOrdem => {
        if(!newOrdem.desc || !newOrdem.desc.trim()) {
            Alert.alert('Dados Inválidos', 'Descrição não informada!')
            return
        }

        const ordens = [...this.state.ordens]
        ordens.push({
            id: Math.random(),
            desc: newOrdem.desc,
            estimateAt: newOrdem.date,
            doneAt: null
        })

        this.setState({ ordens, showAddOrdem: false }, this.filterOrdens)
    }

    render() {
        const today = moment().locale('pt-br').format('ddd, D [de] MMMM')
        return (
            <View style={styles.container}>
                <AddOrdem isVisible={this.state.showAddOrdem}
                    onCancel={() => this.setState({ showAddOrdem: false})}
                    onSave={this.addOrdem}/>
                <ImageBackground source ={todayImage} style={styles.background}>
                    <View style={styles.iconBar}>
                        <TouchableOpacity onPress={this.toggleFilter}>
                            <Icon name={this.state.showDoneOrdens ? 'eye' : 'eye-slash'}
                            size={20} color ={commonStyles.colors.secondary} />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.titleBar}>
                        <Text style={styles.title}>Hoje</Text>
                        <Text style={styles.subtitle}>{today}</Text>
                    </View>
                </ImageBackground>
                <View style={styles.ordensServico}>
                   <FlatList data={this.state.visibleOrdens}
                            keyExtractor={item => `${item.id}`}
                            renderItem={({item}) => <Ordem {...item} toggleOrdem={this.toggleOrdem} /> }   />
                </View>
                <TouchableOpacity style={styles.addButton}
                    activeOpacity={0.7}
                    onPress={() => this.setState({ showAddOrdem : true})}>
                    <Icon name="plus" size={20}
                        color={commonStyles.colors.secondary}/>
                </TouchableOpacity>
            </View>
        )

    }
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1
    },
    background: {
        flexGrow: 3
    },
    ordensServico: {
        flexGrow: 7,
        color: "#AAA",
        fontFamily: commonStyles.fontFamily

    },
    titleBar: {
        flex: 1,
        justifyContent: 'flex-end'
    },
    title: {
        fontFamily: commonStyles.fontFamily,
        color: commonStyles.colors.secondary,
        fontSize: 40,
        marginLeft: 20,
        marginBottom: 20
    },
    subtitle: {
        fontFamily: commonStyles.fontFamily,
        color: commonStyles.colors.secondary,
        fontSize: 20,
        marginLeft: 20,
        marginBottom: 30
    },
    iconBar: {
        flexDirection: 'row',
        marginHorizontal: 20,
        justifyContent: 'flex-end',
        marginTop: Platform.OS === 'ios' ? 40 : 10
    },
    addButton: {
        position: 'absolute',
        right: 30,
        bottom: 30,
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: commonStyles.colors.today,
        justifyContent: 'center',
        alignItems: 'center'
    }

})