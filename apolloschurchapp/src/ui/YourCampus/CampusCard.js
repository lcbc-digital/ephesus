import { useQuery } from '@apollo/client';
import { GET_USER_PROFILE } from '@apollosproject/ui-connected';
import CurrentCampus from './CurrentCampus';

const CampusCard = () => {
  const { data, loading } = useQuery(GET_USER_PROFILE);
  const campus = data?.currentUser?.profile?.campus;
  return campus ? (
    <CurrentCampus
      cardButtonText={'Campus Details'}
      cardTitle={campus.name}
      coverImage={campus.image}
      headerActionText={'Change'}
      campusId={campus.id}
      sectionTitle={'Your Campus'}
      isLoading={loading}
    />
  ) : (
    <CurrentCampus
      cardButtonText={'Select a Campus'}
      cardTitle={'No location'}
      headerActionText={'Select a Campus'}
      sectionTitle={'Your Campus'}
      isLoading={loading}
    />
  );
};

export default CampusCard;
