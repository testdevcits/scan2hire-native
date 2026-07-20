// import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
// import React from 'react'
// import { ChevronDown, ChevronUp, User } from 'lucide-react-native'
// import { COLORS, FONT_SIZE, FONTS, RADIUS, SPACING } from '../../constants'

// const ProfileCollapsibleCard = ({user,setIsProfileCollapsed,isProfileCollapsed}) => {
//   return (
//      <View style={styles.profileCollapsibleCard}>
//           <TouchableOpacity
//             style={styles.profileHeaderRow}
//             onPress={() => setIsProfileCollapsed(!isProfileCollapsed)}
//             activeOpacity={0.7}
//           >
//             <View style={styles.profileHeaderLabelBlock}>
//               <User size={20} color={COLORS.primary} style={{ marginRight: SPACING.sm }} />
//               <Text style={styles.profileCardTitle}>My Profile Overview</Text>
//             </View>
//             {isProfileCollapsed ? <ChevronDown size={20} color={COLORS.textSecondary} /> : <ChevronUp size={20} color={COLORS.textSecondary} />}
//           </TouchableOpacity>

//           {!isProfileCollapsed && (
//             <View style={styles.profileCollapsedBody}>
//               <View style={styles.profileGridItem}>
//                 <Text style={styles.profileFieldLabel}>Employee ID</Text>
//                 <Text style={styles.profileFieldValue}>{user?.employeeProfile?.employeeId || 'N/A'}</Text>
//               </View>

//               <View style={styles.profileGridItem}>
//                 <Text style={styles.profileFieldLabel}>Department</Text>
//                 <Text style={styles.profileFieldValue}>{user?.employeeProfile?.department || 'N/A'}</Text>
//               </View>

//               <View style={styles.profileGridItem}>
//                 <Text style={styles.profileFieldLabel}>Designation</Text>
//                 <Text style={styles.profileFieldValue}>{user?.employeeProfile?.designation || 'N/A'}</Text>
//               </View>

//               <View style={styles.profileGridItem}>
//                 <Text style={styles.profileFieldLabel}>Joining Date</Text>
//                 <Text style={styles.profileFieldValue}>
//                   {user?.employeeProfile?.dateOfJoining
//                     ? new Date(user.employeeProfile.dateOfJoining).toLocaleDateString()
//                     : 'N/A'}
//                 </Text>
//               </View>

//               <View style={styles.profileGridItem}>
//                 <Text style={styles.profileFieldLabel}>Reporting Manager</Text>
//                 <Text style={styles.profileFieldValue}>{user?.employeeProfile?.reportingManager || 'N/A'}</Text>
//               </View>

//               <View style={styles.profileGridItem}>
//                 <Text style={styles.profileFieldLabel}>Emp Type</Text>
//                 <Text style={styles.profileFieldValue}>{user?.employeeProfile?.employeeType || 'N/A'}</Text>
//               </View>
//             </View>
//           )}
//         </View>
//   )
// }

// export default ProfileCollapsibleCard

// const styles = StyleSheet.create({

//     profileCollapsibleCard: {
//         backgroundColor: COLORS.surface,
//         borderRadius: RADIUS.md,
//         borderWidth: 1,
//         borderColor: COLORS.border,
//         marginBottom: SPACING.lg,
//         overflow: 'hidden',
//       },
//       profileHeaderRow: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//         padding: SPACING.md,
//         backgroundColor: COLORS.grey50,
//       },
//       profileHeaderLabelBlock: {
//         flexDirection: 'row',
//         alignItems: 'center',
//       },
//       profileCardTitle: {
//         fontFamily: FONTS.bold,
//         fontSize: FONT_SIZE.md,
//         color: COLORS.textPrimary,
//       },
//       profileCollapsedBody: {
//         padding: SPACING.md,
//         flexDirection: 'row',
//         flexWrap: 'wrap',
//         justifyContent: 'space-between',
//       },
//       profileGridItem: {
//         width: '48%',
//         marginBottom: SPACING.md,
//       },
//       profileFieldLabel: {
//         fontFamily: FONTS.medium,
//         fontSize: FONT_SIZE.xs,
//         color: COLORS.textLight,
//         marginBottom: 2,
//       },
//       profileFieldValue: {
//         fontFamily: FONTS.semiBold,
//         fontSize: FONT_SIZE.sm,
//         color: COLORS.textPrimary,
//       },
    
// });


import React from 'react';
import { View, StyleSheet, TouchableOpacity, LayoutAnimation, Platform, UIManager } from 'react-native';
import { 
  User, 
  ChevronDown, 
  ChevronUp,
  IdCard, 
  Building2, 
  Briefcase, 
  CalendarDays, 
  Users2, 
  Fingerprint 
} from 'lucide-react-native';
import { COLORS, FONT_SIZE, FONTS, RADIUS, SPACING } from '../../constants';
import AppText from '../../components/common/AppText';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface ProfileCollapsibleCardProps {
  user: any;
  setIsProfileCollapsed: (val: boolean) => void;
  isProfileCollapsed: boolean;
}

const ProfileCollapsibleCard: React.FC<ProfileCollapsibleCardProps> = ({ 
  user, 
  setIsProfileCollapsed, 
  isProfileCollapsed 
}) => {
  const toggleCollapse = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsProfileCollapsed(!isProfileCollapsed);
  };

  const ProfileItem = ({ icon: Icon, label, value }: { icon: any, label: string, value: string }) => (
    <View style={styles.gridItem}>
      <View style={styles.iconContainer}>
        <Icon size={14} color={COLORS.primary} strokeWidth={2.5} />
      </View>
      <View style={styles.textContainer}>
        <AppText style={styles.fieldLabel}>{label}</AppText>
        <AppText style={styles.fieldValue} numberOfLines={1}>{value || 'N/A'}</AppText>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.header}
        onPress={toggleCollapse}
        activeOpacity={0.6}
      >
        <View style={styles.headerLeft}>
          <View style={styles.userIconBox}>
            <User size={20} color={COLORS.white} />
          </View>
          <View>
            <AppText style={styles.headerTitle}>Professional Profile</AppText>
            <AppText style={styles.headerSubtitle}>Employment & Department details</AppText>
          </View>
        </View>
        
        <View style={styles.chevronCircle}>
          {isProfileCollapsed ? (
            <ChevronDown size={18} color={COLORS.textSecondary} />
          ) : (
            <ChevronUp size={18} color={COLORS.textSecondary} />
          )}
        </View>
      </TouchableOpacity>

      {!isProfileCollapsed && (
        <View style={styles.body}>
          <View style={styles.grid}>
            <ProfileItem 
              icon={Fingerprint} 
              label="Employee ID" 
              value={user?.employeeProfile?.employeeId} 
            />
            <ProfileItem 
              icon={Building2} 
              label="Department" 
              value={user?.employeeProfile?.department} 
            />
            <ProfileItem 
              icon={Briefcase} 
              label="Designation" 
              value={user?.employeeProfile?.designation} 
            />
            <ProfileItem 
              icon={CalendarDays} 
              label="Joining Date" 
              value={user?.employeeProfile?.dateOfJoining ? new Date(user.employeeProfile.dateOfJoining).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric'}) : ''} 
            />
            <ProfileItem 
              icon={Users2} 
              label="Manager" 
              value={user?.employeeProfile?.reportingManager} 
            />
            <ProfileItem 
              icon={IdCard} 
              label="Emp Type" 
              value={user?.employeeProfile?.employeeType} 
            />
          </View>
          
          {/* Subtle footer hint */}
          <View style={styles.footerHint}>
            <AppText style={styles.hintText}>Data verified by HR Department</AppText>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.lg,
    // Soft shadow
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 1,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  userIconBox: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FONT_SIZE.lg,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  },
  headerSubtitle: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginTop: -2,
  },
  chevronCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.grey50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  body: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.grey100,
  },
  gridItem: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.sm,
    backgroundColor: '#EFF6FF', // Very light blue
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 10,
    fontFamily: FONTS.bold,
    color: COLORS.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  fieldValue: {
    fontSize: 14,
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
    marginTop: 1,
  },
  footerHint: {
    marginTop: SPACING.xs,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.grey50,
    paddingTop: SPACING.md,
  },
  hintText: {
    fontSize: 11,
    fontFamily: FONTS.italic,
    color: COLORS.textLight,
  }
});

export default ProfileCollapsibleCard;
