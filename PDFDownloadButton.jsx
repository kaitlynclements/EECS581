import React from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import ItineraryPDF from './ItineraryPDF';

const PDFDownloadButton = ({ trip, activities, expenses }) => (
  <PDFDownloadLink
    document={
      <ItineraryPDF 
        trip={trip}
        activities={Array.isArray(activities) ? activities : []}
        expenses={expenses}
      />
    }
    fileName={`${trip.name}-itinerary.pdf`}
  >
    {({ blob, url, loading, error }) => 
      loading ? 'Generating PDF...' : 'Export Itinerary as PDF'
    }
  </PDFDownloadLink>
);

export default PDFDownloadButton; 