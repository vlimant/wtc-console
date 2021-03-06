import React from 'react';
import PropTypes from 'prop-types';
import getListDataType from '../types/ListData';
import styled from 'styled-components';
import {getPages} from '../utils/pages';
import DataTable from './DataTable';

const Wrapper = styled.div`
    width: 100%;
`;

const PagerWrapper = styled.div`
    width: 100%;
`;

const Pages = styled.ul`
    text-align: center;
    padding: 5px;
    
    li {
        display: inline-block;
        padding: 4px;
        font-size: 14px;
    }
    a {
        font-size: 14px;
        text-decoration: none;
    }
`;

export default class PagedDataTable extends React.Component {
    static propTypes = {
        data: getListDataType(PropTypes.any).isRequired,
        columns: PropTypes.arrayOf(PropTypes.shape({
            key: PropTypes.string.isRequired,
            title: PropTypes.string.isRequired,
            width: PropTypes.string,
            transformFn: PropTypes.func,
            align: PropTypes.string,
        })).isRequired,
        onChangePage: PropTypes.func,
        idColumn: PropTypes.string,
        onClickFn: PropTypes.func,
        sortFn: PropTypes.func,
        sortedBy: PropTypes.string,
        desc: PropTypes.bool,
    };

    renderPager = () => {
        const {onChangePage, data} = this.props;

        return (
            <PagerWrapper>
                <Pages>
                    {getPages(data.pages).map((page, idx) =>
                        <li key={`page_${idx}`}>
                            {data.current === page
                                ? <strong>{page}</strong>
                                : <a onClick={() => onChangePage(page)}>{page}</a>
                            }
                        </li>
                    )}
                </Pages>
            </PagerWrapper>
        )
    };

    render() {
        const {data} = this.props;
        return (
            <Wrapper>
                <DataTable {...this.props} data={data.results}/>
                {this.renderPager()}
            </Wrapper>
        );
    }
}