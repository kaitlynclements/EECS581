import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 30,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 10,
  },
  activity: {
    marginBottom: 8,
    padding: 8,
    backgroundColor: '#f0f0f0',
  },
  expense: {
    marginBottom: 5,
  },
  summary: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#e0e0e0',
  }
});

const ItineraryPDF = ({ trip, activities, expenses }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.title}>{trip.name} - Travel Itinerary</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Trip Details</Text>
        <Text>Destination: {trip.destination}</Text>
        <Text>Dates: {trip.start_date} to {trip.end_date}</Text>
        <Text>Budget: ${trip.budget}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Activities</Text>
        {activities.map((activity, index) => (
          <View key={index} style={styles.activity}>
            <Text>{activity.name}</Text>
            <Text>Date: {activity.date} at {activity.time}</Text>
            <Text>Location: {activity.location}</Text>
            <Text>Cost: ${activity.cost || 0}</Text>
          </View>
        ))}
      </View>

      <View style={styles.summary}>
        <Text style={styles.sectionTitle}>Expense Summary</Text>
        {Object.entries(expenses).map(([category, amount]) => (
          <Text key={category} style={styles.expense}>
            {category}: ${amount}
          </Text>
        ))}
        <Text>Total Spent: ${Object.values(expenses).reduce((a, b) => a + b, 0)}</Text>
      </View>
    </Page>
  </Document>
);

export default ItineraryPDF;