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

import AsyncStorage from "@react-native-community/async-storage"
import Icon from 'react-native-vector-icons/FontAwesome'
import axios from 'axios'
import moment from 'moment'
import 'moment/locale/pt-br'

import todayImage from '../../assets/imgs/today.jpg'
import tomorrowImage from '../../assets/imgs/tomorrow.jpg'
import weekImage from '../../assets/imgs/week.jpg'
import monthImage from '../../assets/imgs/month.jpg'

import { server, showError } from '../common'
import commonStyles from '../commonStyles'
import Ordem from '../components/Ordem'
import AddOrdem from './AddOrdem'

const initialState = {
    showDoneOrdens: true,
    showAddOrdem: false,
    visibleOrdens: [],
    ordens: []
}

export default class OrdensServico extends Component {
    state = {
        ...initialState
    }

    componentDidMount = async () => {
        const stateString = await AsyncStorage.getItem('ordensState')
        const savedState = JSON.parse(stateString) || initialState
        this.setState({
            showDoneOrdens: savedState.showDoneOrdens
        }, this.filterOrdens)

        this.loadOrdens()
    }

    loadOrdens = async () => {
        try {
            const maxDate = moment()
                .add({ days: this.props.daysAhead})
                .format('YYYY-MM-DD 23:59:59')
            const res = await axios.get(`${server}/ordens?date=${maxDate}`)
            this.setState({ ordens: res.data }, this.filterOrdens)
        } catch(e) {
            showError(e)
        }
    }

    toggleFilter = () => {
        this.setState({ showDoneOrdens: !this.state.showDoneOrdens }, this.filterOrdens)
    }

    filterOrdens = () => {
        let visibleOrdens = null
        if(this.state.showDoneOrdens) {
            visibleOrdens = [...this.state.ordens]
        } else {
            const pending = ordem => ordem.doneAt === null
            visibleOrdens = this.state.orders.filter(pending)
        }

        this.setState({ visibleOrdens })
        AsyncStorage.setItem('ordensState', JSON.stringify({
            showDoneOrdens: this.state.showDoneOrdens
        }))
    }

    toggleOrdem = async ordemId => {
        try {
            await axios.put(`${server}/ordens/${ordemId}/toggle`)
            this.loadOrdens()
        } catch(e) {
            showError(e)
        }
    }

    addOrdem = async newOrdem => {
        if(!newOrdem.desc || !newOrdem.desc.trim()) {
            Alert.alert('Dados Inválidos', 'Descrição não informada!')
            return 
        }

        try {
            await axios.post(`${server}/ordens`, {
               desc: newOrdem.desc,
               estimateAt: newOrdem.date 
            })

            this.setState({ showAddOrdem: false }, this.loadOrdens)
        } catch(e) {
            showError(e)
        }
    }

    deleteOrdem = async ordemId => {
        try {
            await axios.delete(`${server}/ordens/${ordemId}`)
            this.loadOrdens()
        } catch(e) {
            showError(e)
        }
    }

    getImage = () => {
        switch(this.props.daysAhead) {
            case 0: return todayImage
            case 1: return tomorrowImage
            case 7: return weekImage
            default: return monthImage
        }
    }

    getColor = () => {
        switch(this.props.daysAhead) {
            case 0: return commonStyles.colors.today
            case 1: return commonStyles.colors.tomorrow
            case 7: return commonStyles.colors.week
            default: return commonStyles.colors.month
        }
    }

    render() {
        const today = moment().locale('pt-br').format('ddd, D [de] MMMM')
        return (
            <View style={styles.container}>
                <AddOrdem isVisible={this.state.showAddOrdem}
                    onCancel={() => this.setState({ showAddOrdem: false })}
                    onSave={this.addOrdem} />
                <ImageBackground source={this.getImage()}
                    style={styles.background}>
                    <View style={styles.iconBar}>
                        <TouchableOpacity onPress={() => this.props.navigation.openDrawer()}>
                            <Icon name='bars'
                                size={20} color={commonStyles.colors.secondary} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={this.toggleOrdem}>
                            <Icon name={this.state.showDoneOrdens ? 'eye' : 'eye-slash'}
                                size={20} color={commonStyles.colors.secondary} />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.titleBar}>
                        <Text style={styles.title}>{this.props.title}</Text>
                        <Text style={styles.subtitle}>{today}</Text>
                    </View>
                </ImageBackground>
                <View style={styles.ordensServico}>
                    <FlatList data={this.state.visibleOrdens}
                        keyExtractor={item => `${item.id}`}
                        renderItem={({item}) => <Ordem {...item} onToggleOrdem={this.toggleOrdem} onDelete={this.deleteOrdem} />} />
                </View>
                <TouchableOpacity style={[
                        styles.addButton,
                        { backgroundColor: this.getColor() 
                    }]} 
                    activeOpacity={0.7}
                    onPress={() => this.setState({ showAddOrdem: true })}>
                    <Icon name="plus" size={20}
                        color={commonStyles.colors.secondary} />
                </TouchableOpacity>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    background: {
        flex: 3
    },
    ordensServico: {
        flex: 7
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
    },
    iconBar: {
        flexDirection: 'row',
        marginHorizontal: 20,
        justifyContent: 'space-between',
        marginTop: Platform.OS === 'ios' ? 40 : 10
    },
    addButton: {
        position: 'absolute',
        right: 30,
        bottom: 30,
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center'
    }
});