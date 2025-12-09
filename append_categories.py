#!/usr/bin/env python3
"""Script to append remaining categories to words.js"""

# Read the agent's output containing cities, states, and countries
remaining_data = """,
    // American Cities Category
    'american-cities': [
        { word: 'New York', chord: 'TPHAOU/KWRORK' },
        { word: 'Los Angeles', chord: 'HROS/APB/SKWREL/ES' },
        { word: 'Chicago', chord: 'SHEUBG' },
        { word: 'Houston', chord: 'HAOUFT' },
        { word: 'Phoenix', chord: 'TPAOE/TPHEUBGS' },
        { word: 'Philadelphia', chord: 'TPHEUL' },
        { word: 'San Antonio', chord: 'SAPB/APB/TOEUPB/KWRO' },
        { word: 'San Diego', chord: 'SAPB/TKAOE/EG/O*' },
        { word: 'Dallas', chord: 'TKAL/AS' },
        { word: 'San Jose', chord: 'SAPB/HO/SA*EU' },
        { word: 'Austin', chord: 'AUFPT' },
        { word: 'Jacksonville', chord: 'SKWRABG/SOPB/SREL' },
        { word: 'Fort Worth', chord: 'TPORT/WORT' },
        { word: 'Columbus', chord: 'KA/HRUPL/PWUS' },
        { word: 'Charlotte', chord: 'SHAR/HROT' },
        { word: 'Indianapolis', chord: 'EUPBD/KWRAPB/PO*L' },
        { word: 'Seattle', chord: 'SAOET' },
        { word: 'Denver', chord: 'TKEFRB' },
        { word: 'Washington', chord: 'WORBG' },
        { word: 'Boston', chord: 'PWOFT' },
        { word: 'Nashville', chord: 'TPHAERB/SEL' },
        { word: 'Detroit', chord: 'TKRE/TROEU' },
        { word: 'Portland', chord: 'PORT/HRAPBD' },
        { word: 'Memphis', chord: 'PHEFP/KWREUS' },
        { word: 'Oklahoma City', chord: 'O*BG/HROEPL/SEUT' },
        { word: 'Las Vegas', chord: 'HRAS/SRAEGS' },
        { word: 'Louisville', chord: 'HRAOU/EUF/SEL' },
        { word: 'Baltimore', chord: 'PWAULD' },
        { word: 'Milwaukee', chord: 'PHEUL/WAU/KAOE' },
        { word: 'Albuquerque', chord: 'AL/PWAO*U/K*ERG' },
        { word: 'Tucson', chord: 'TAOU/SOPB' },
        { word: 'Fresno', chord: 'TPRES/TPHOE' },
        { word: 'Mesa', chord: 'PHAOE/SA*' },
        { word: 'Sacramento', chord: 'SAK/RA/PHEPBT/O*' },
        { word: 'Atlanta', chord: 'AELT' },
        { word: 'Kansas City', chord: 'KAPBS/SEUT' },
        { word: 'Colorado Springs', chord: 'KO*L/O*/RA/SPREUGS' },
        { word: 'Raleigh', chord: 'RAL/KWREU' },
        { word: 'Miami', chord: 'PHAOEU/APL' },
        { word: 'Long Beach', chord: 'HROPBG/PWAOEFP' },
        { word: 'Virginia Beach', chord: 'SREUPBG/PWAOEFP' },
        { word: 'Omaha', chord: 'O*/PHA/HA*' },
        { word: 'Oakland', chord: 'OEBG/HRAPBD' },
        { word: 'Minneapolis', chord: 'PHEUPB/KWRAPB/PO*L' },
        { word: 'Tulsa', chord: 'TAOUL/SA*' },
        { word: 'Tampa', chord: 'TAPL/PA*' },
        { word: 'Arlington', chord: 'ARL/EUPBG/TOPB' },
        { word: 'New Orleans', chord: 'TPHAOU/OR/HRAOEPBS' },
        { word: 'Wichita', chord: 'WEUFP/TA*' },
        { word: 'Cleveland', chord: 'KHRAOEFL' },
        { word: 'Bakersfield', chord: 'PWAEUBG/ERS/TPAOEL' },
        { word: 'Aurora', chord: 'A*/ROR/A*' },
        { word: 'Anaheim', chord: 'APB/A*/HAEUPL' },
        { word: 'Honolulu', chord: 'HO/TPH*O/HRAO*U/HRAOU' },
        { word: 'Santa Ana', chord: 'SAPBT/A*/APB/A*' },
        { word: 'Riverside', chord: 'REUFR/SAOEUD' },
        { word: 'Corpus Christi', chord: 'KORP/US/KHREUFPT' },
        { word: 'Lexington', chord: 'HR*EBGS/EUPBG/TOPB' },
        { word: 'Henderson', chord: 'H*EPB/TKERPB/SOPB' },
        { word: 'Stockton', chord: 'STOBG/TOPB' },
        { word: 'Saint Paul', chord: 'SAEUPT/PAUBL' },
        { word: 'Cincinnati', chord: 'SEUPB/SEUPB' },
        { word: 'Pittsburgh', chord: 'PEUTS' },
        { word: 'Greensboro', chord: 'TKPWRAOEPBS/PWOR/O*' },
        { word: 'Anchorage', chord: 'APB/KHOR/EUPBLG' },
        { word: 'Plano', chord: 'PHRAPB/O*' },
        { word: 'Lincoln', chord: 'HREUPBG/KOPB' },
        { word: 'Orlando', chord: 'OR/HRAPBD/O*' },
        { word: 'Irvine', chord: 'ER/SRAOEUPB' },
        { word: 'Newark', chord: 'TPHAOU/ARK' },
        { word: 'Toledo', chord: 'TO*/HRAOE/TKO*' },
        { word: 'Durham', chord: 'TKUR/APL' },
        { word: 'Chula Vista', chord: 'KHAOU/HRA*/SREUFPT/A*' },
        { word: 'Fort Wayne', chord: 'TPORT/WAEUPB' },
        { word: 'Jersey City', chord: 'SKWRERS/SEUT' },
        { word: 'Saint Petersburg', chord: 'SAEUPT/PAOE/TERS' },
        { word: 'Laredo', chord: 'HRA/RAOE/TKO*' },
        { word: 'Madison', chord: 'PHAD/KWREU/SOPB' },
        { word: 'Chandler', chord: 'KHAPBD/HRER' },
        { word: 'Buffalo', chord: 'PWUFL/O*' },
        { word: 'Lubbock', chord: 'HRAUB/ABG' },
        { word: 'Scottsdale', chord: 'SKOT/S/TKAEUBL' },
        { word: 'Reno', chord: 'RAOE/TPHOE' },
        { word: 'Glendale', chord: 'TKPWHREUPB/TKAEL' },
        { word: 'Gilbert', chord: 'TKPWEUL/PWERT' },
        { word: 'Winston-Salem', chord: 'WEUPB/STOPB/SA*EL' },
        { word: 'Norfolk', chord: 'TPHOR/TPOBG' },
        { word: 'Chesapeake', chord: 'KHES/A*/PAOEBG' },
        { word: 'Garland', chord: 'TKPWAR/HRAPBD' },
        { word: 'Irving', chord: 'ER/SEUFRG' },
        { word: 'Hialeah', chord: 'HAOE/A*/HRAOE/A*' },
        { word: 'Richmond', chord: 'REUFRPLD' },
        { word: 'Boise', chord: 'PWOEUZ' },
        { word: 'Spokane', chord: 'SPO*/KAPB' },
        { word: 'Fremont', chord: 'TPRAOE/PHOPBT' },
        { word: 'Baton Rouge', chord: 'PWAT/ROPBLG' },
        { word: 'San Bernardino', chord: 'SAPB/PW*ER/TPHAR/TKAOEPB' },
        { word: 'Modesto', chord: 'PHO*/TK*ES/TO*' },
        { word: 'Fontana', chord: 'TPOPBT/APB/A*' },
        { word: 'Des Moines', chord: 'TK*E/PHOEUPBS' }
    ]
"""

# Read current words.js file
with open('words.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove the closing }; to append more data
if content.rstrip().endswith('};'):
    content = content.rstrip()[:-2]  # Remove };

# Append the new content and close properly
content += remaining_data + "\n};"

# Write back
with open('words.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Successfully appended American Cities category!")
