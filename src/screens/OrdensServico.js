import React, { Component } from 'react'
import { View, Text, ImageBackground, StyleSheet, FlatList } from 'react-native'

import commonStyles from '../commonStyles.js'
import todayImage from '../../assets/imgs/today.jpg'

import moment from 'moment'
import 'moment/locale/pt-br'

import Ordens from '../components/Ordens'

export default class OrdensServico extends Component {

    state = {
        ordens: [{
            id: Math.random(),
            desc: 'Atendimento OS 123',
            estimateAt: new Date(),
            doneAt: new Date()
        },{
            id: Math.random(),
            desc: 'Atendimento OS 122',
            estimateAt: new Date(),
            doneAt: null        
        }]

    }

    toggleOrdem = ordemId => {
        const ordens = [...this.state.ordens]
        ordens.forEach(ordem => {
            if(ordem.id === ordemId) {
                ordem.doneAt = ordem.doneAt ? null : new Date()
            }
        })
        
        this.setState({ordens})
    }

    render() {
        const today = moment().locale('pt-br').format('ddd, D [de] MMMM')
        return (
            <View style={styles.container}>
                <ImageBackground source ={todayImage}
                    style={styles.background}>
                    <View style={styles.titleBar}>
                        <Text style={styles.title}>Hoje</Text>
                        <Text style={styles.subtitle}>{today}</Text>
                    </View>
                </ImageBackground>
                <View style={styles.ordensServico}>
                   <FlatList data={this.state.ordens}
                            keyExtractor={item => `${item.id}`}
                            renderItem={({item}) => <Ordens {...item} toggleOrdem = {this.toggleOrdem} />}   />
                </View>
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
        fontSize: 50,
        marginLeft: 20,
        marginBottom: 20
    },
    subtitle: {
        fontFamily: commonStyles.fontFamily,
        color: commonStyles.colors.secondary,
        fontSize: 20,
        marginLeft: 20,
        marginBottom: 30
    }
})