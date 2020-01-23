import CenteredBox from '../components/centered-box';
import FeaturesList from '../components/features-list';
import HeroButton from '../components/hero-button';
import PageLayout from '../components/page-layout';
import PropTypes from 'prop-types';
import React, {Fragment} from 'react';
import dishes from '../assets/dishes.png';
import thumbsUp from '../assets/thumbs-up.png';
import {Box, Grid, Typography} from '@material-ui/core';
import {Link, graphql} from 'gatsby';

function PricingGridItem({label, plan, ...props}) {
  return (
    <Grid item xs={4}>
      <Box p={4} border={1} borderColor="divider" textAlign="center" {...props}>
        <Typography gutterBottom>{label}</Typography>
        <Typography variant="h4">
          {typeof plan === 'string' ? (
            plan
          ) : (
            <Fragment>
              ${plan.amount / 100}
              <Typography variant="h6" component="span">
                /{plan.interval}
              </Typography>
            </Fragment>
          )}
        </Typography>
      </Box>
    </Grid>
  );
}

PricingGridItem.propTypes = {
  label: PropTypes.string.isRequired,
  plan: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired
};

export default function Home(props) {
  return (
    <PageLayout>
      <div
        style={{
          backgroundImage: `url(${dishes})`,
          backgroundSize: 360,
          backgroundPosition: 'calc(50vw + 80px) center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <CenteredBox py={12} px={8}>
          <Box width={1 / 2}>
            <Typography gutterBottom variant="h2">
              Hassle-free headless Wordpress with GraphQL
            </Typography>
            <Typography paragraph variant="h6">
              Saucer lets you deploy a headless Wordpress CMS in minutes, and
              access your data using a GraphQL API to build fast websites with
              modern tools.
            </Typography>
            <HeroButton component={Link} to="/dashboard">
              Try for free
            </HeroButton>
            <Box component="span" ml={3}>
              <Typography component="span" variant="body2">
                No credit card required
              </Typography>
            </Box>
          </Box>
        </CenteredBox>
      </div>
      <CenteredBox px={8} py={3}>
        <Grid container alignItems="center">
          <PricingGridItem borderRight={0} label="14 day trial" plan="Free" />
          <PricingGridItem
            p={6}
            border={2}
            borderColor="primary.main"
            bgcolor="background.paper"
            label="Best value"
            plan={props.data.year}
          />
          <PricingGridItem
            borderLeft={0}
            label="More flexible"
            plan={props.data.month}
          />
        </Grid>
      </CenteredBox>
      <CenteredBox py={10} px={8}>
        <Typography paragraph variant="h3">
          What you get
        </Typography>
        <Box display="flex" alignItems="flex-start">
          <div>
            <Typography paragraph variant="h6">
              Every Saucer instance comes pre-installed with everything you need
              to get your Wordpress-backed GraphQL website up and running with
              no hassle. This includes:
            </Typography>
            <FeaturesList />
          </div>
          <Box component="img" mx={5} src={thumbsUp} height={400} />
        </Box>
      </CenteredBox>
    </PageLayout>
  );
}

Home.propTypes = {
  data: PropTypes.object.isRequired
};

export const pageQuery = graphql`
  {
    year: stripePlan(interval: {eq: "year"}) {
      amount
      interval
    }
    month: stripePlan(interval: {eq: "month"}) {
      amount
      interval
    }
  }
`;
