import React, { Component } from 'react'
import {
    StyleSheet,
    Text,
    View,
    ImageBackground,
    FlatList,
    TouchableOpacity,
    Platform
} from 'react-native'
import axios from 'axios'
import moment from 'moment'
import 'moment/locale/pt-br'
import commonStyles from '../commonStyles'
import Ordem from '../components/Ordem'
import Icon from 'react-native-vector-icons/FontAwesome'
import ActionButton from 'react-native-action-button'
import AddOrdem from './AddOrdem'
import { server, showError } from '../common'

import todayImage from '../../assets/imgs/today.jpg'
import tomorrowImage from '../../assets/imgs/tomorrow.jpg'
import weekImage from '../../assets/imgs/week.jpg'
import monthImage from '../../assets/imgs/month.jpg'


export default class OrdensServico extends Component {

    state = {
        tasks: [],
        visibleTasks: [],
        showDoneTasks: true,
        showAddTask: false,
    }

    addOrdem = async ordem => {
        try {
            await axios.post(`${server}/ordens`, {
                desc: ordem.desc,
                estimateAt: ordem.date
            })

            this.setState({ showAddOrdem: false }, this.loadOrdens)
        } catch (err) {
            showError(err)
        }
    }

    deleteOrdem = async id => {
        try {
            await axios.delete(`${server}/ordens/${id}`)
            await this.loadOrdens()
        } catch (err) {
            showError(err)
        }
    }

    filterOrdens = () => {
        let visibleOrdens = null
        if (this.state.showDoneOrdens) {
            visibleOrdens = [...this.state.ordens]
        } else {
            const pending = ordem => ordem.doneAt === null
            visibleOrdens = this.state.ordens.filter(pending)
        }
        this.setState({ visibleOrdens })
    }

    toggleFilter = () => {
        this.setState({ showDoneOrdens: !this.state.showDoneOrdens }
            , this.filterOrdens)
    }

    componentDidMount = async () => {
        this.loadOrdens()
    }

    toggleOrdem = async id => {
        try {
            await axios.put(`${server}/ordens/${id}/toggle`)
            await this.loadOrdens()
        } catch (err) {
            showError(err)
        }
    }

    loadOrdens = async () => {
        try {
            const maxDate = moment()
                .add({ days: this.props.daysAhead })
                .format('YYYY-MM-DD 23:59')
            const res = await axios.get(`${server}/ordens?date=${maxDate}`)
            this.setState({ ordens: res.data }, this.filterOrdens)
        } catch (err) {
            showError(err)
        }
    }

    render() {
        let styleColor = null
        let image = null

        switch(this.props.daysAhead) {
            case 0:
                styleColor = commonStyles.colors.today
                image = todayImage
                break
            case 1:
                styleColor = commonStyles.colors.tomorrow
                image = tomorrowImage
                break
            case 7:
                styleColor = commonStyles.colors.week
                image = weekImage
                break
            default:
                styleColor = commonStyles.colors.month
                image = monthImage
                break
        }

        return (
            <View style={styles.container}>
                <AddOrdem isVisible={this.state.showAddOrdem}
                    onSave={this.addOrdem}
                    onCancel={() => this.setState({ showAddOrdem: false })} />
                <ImageBackground source={image}
                    style={styles.background}>
                    <View style={styles.iconBar}>
                        <TouchableOpacity onPress={() => this.props.navigation.openDrawer()}>
                            <Icon name='bars' size={20} color={commonStyles.colors.secondary} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={this.toggleFilter}>
                            <Icon name={this.state.showDoneOrdens ? 'eye' : 'eye-slash'}
                                size={20} color={commonStyles.colors.secondary} />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.titleBar}>
                        <Text style={styles.title}>{this.props.title}</Text>
                        <Text style={styles.subtitle}>
                            {moment().locale('pt-br').format('ddd, D [de] MMMM')}
                        </Text>
                    </View>
                </ImageBackground>
                <View style={styles.taksContainer}>
                    <FlatList data={this.state.visibleOrdens}
                        keyExtractor={item => `${item.id}`}
                        renderItem={({ item }) => 
                            <Ordem {...item} onToggleOrdem={this.toggleOrdem}
                                onDelete={this.deleteOrdem} />} />
                </View>
                <ActionButton buttonColor={styleColor}
                    onPress={() => { this.setState({ showAddOrdem: true }) }} />
            </View >
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    background: {
        flex: 3,
    },
    titleBar: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    title: {
        fontFamily: commonStyles.fontFamily,
        color: commonStyles.colors.secondary,
        fontSize: 50,
        marginLeft: 20,
        marginBottom: 10,
    },
    subtitle: {
        fontFamily: commonStyles.fontFamily,
        color: commonStyles.colors.secondary,
        fontSize: 20,
        marginLeft: 20,
        marginBottom: 30,
    },
    taksContainer: {
        flex: 7,
    },
    iconBar: {
        marginTop: Platform.OS === 'ios' ? 30 : 10,
        marginHorizontal: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
    }
})