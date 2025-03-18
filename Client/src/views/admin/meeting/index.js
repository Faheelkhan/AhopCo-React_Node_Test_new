import { useEffect, useState } from 'react';
import { DeleteIcon, ViewIcon } from '@chakra-ui/icons';
import { Button, Menu, MenuButton, MenuItem, MenuList, Text, useDisclosure } from '@chakra-ui/react';
import { getApi } from 'services/api';
import { HasAccess } from '../../../redux/accessUtils';
import CommonCheckTable from '../../../components/reactTable/checktable';
import { SearchIcon } from "@chakra-ui/icons";
import { CiMenuKebab } from 'react-icons/ci';
import { Link, useNavigate } from 'react-router-dom';
import MeetingAdvanceSearch from './components/MeetingAdvanceSearch';
import AddMeeting from './components/Addmeeting';
import CommonDeleteModel from 'components/commonDeleteModel';
import { deleteManyApi } from 'services/api';
import { toast } from 'react-toastify';
import { fetchMeetingData } from '../../../redux/slices/meetingSlice';
import { useDispatch } from 'react-redux';

const Index = () => {
    const title = "Meeting";
    const navigate = useNavigate()
    const [action, setAction] = useState(false);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [selectedValues, setSelectedValues] = useState([]);
    const [advanceSearch, setAdvanceSearch] = useState(false);
    const [getTagValuesOutSide, setGetTagValuesOutside] = useState([]);
    const [searchboxOutside, setSearchboxOutside] = useState('');
    const user = JSON.parse(localStorage.getItem("user"));
    const [deleteMany, setDeleteMany] = useState(false);
    const [isLoding, setIsLoding] = useState(false);
    const [data, setData] = useState([]);
    const [displaySearchData, setDisplaySearchData] = useState(false);
    const [searchedData, setSearchedData] = useState([]);
    const [permission] = HasAccess(['Meetings'])
    const dispatch = useDispatch()


    const actionHeader = {
        Header: "Action", isSortable: false, center: true,
        cell: ({ row }) => (
            <Text fontSize="md" fontWeight="900" textAlign={"center"}>
                <Menu isLazy  >
                    <MenuButton><CiMenuKebab /></MenuButton>
                    <MenuList minW={'fit-content'} transform={"translate(1520px, 173px);"}>

                        {permission?.view && <MenuItem py={2.5} color={'green'}
                            onClick={() => navigate(`/metting/${row?.values._id}`)}
                            icon={<ViewIcon fontSize={15} />}>View</MenuItem>}
                        {permission?.delete && <MenuItem py={2.5} color={'red'} onClick={() => { setDeleteMany(true); setSelectedValues([row?.values?._id]); }} icon={<DeleteIcon fontSize={15} />}>Delete</MenuItem>}
                    </MenuList>
                </Menu>
            </Text>
        )
    }
    const tableColumns = [
        {
            Header: "#",
            accessor: "_id",
            isSortable: false,
            width: 10
        },
        {
            Header: 'Agenda', accessor: 'agenda', cell: (cell) => (
                <Link to={`/metting/${cell?.row?.values._id}`}> <Text
                    me="10px"
                    sx={{ '&:hover': { color: 'blue.500', textDecoration: 'underline' } }}
                    color='brand.600'
                    fontSize="sm"
                    fontWeight="700"
                >
                    {cell?.value || ' - '}
                </Text></Link>)
        },
        { Header: "Date & Time", accessor: "dateTime", },
        { Header: "Time Stamp", accessor: "timestamp", },
        { Header: "Create By", accessor: "createdByName", },
        ...(permission?.update || permission?.view || permission?.delete ? [actionHeader] : [])

    ];

    const fetchData = async () => {
        setIsLoding(true);
        try {
            console.log("Fetching meeting data...");
            const result = await dispatch(fetchMeetingData({ 
                timestamp: new Date().getTime() 
            }));
            
            console.log("Redux result:", result);
            
            if (result.payload && result.payload.status === 200) {
                // Access the meetings array from the correct location in the response
                const meetings = result.payload.data.meetings || [];
                console.log("Raw meetings data:", meetings);
                
                if (meetings.length === 0) {
                    console.log("No meetings found in the response");
                }
                
                const formattedData = meetings.map(meeting => ({
                    _id: meeting._id,
                    agenda: meeting.title,
                    dateTime: new Date(meeting.startTime).toLocaleString(),
                    timestamp: new Date(meeting.createdAt).toLocaleString(),
                    createdByName: meeting.organizer?.firstName 
                        ? `${meeting.organizer.firstName} ${meeting.organizer.lastName}`
                        : 'Unknown'
                }));
                
                setData(formattedData);
                console.log("Formatted meetings:", formattedData);
            } else {
                setData([]);
                toast.error("Failed to fetch data");
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            setData([]);
            toast.error("An error occurred while fetching data");
        } finally {
            setIsLoding(false);
        }
    };

    const handleAddMeeting = async (newMeeting) => {
        try {
            setIsLoding(true);
            const response = await getApi.post('/api/meeting', newMeeting);
            if (response.status === 201) {
                setAction((prev) => !prev); // Trigger re-fetch
                toast.success("Meeting added successfully");
            }
        } catch (error) {
            console.error("Error adding meeting:", error);
            toast.error("Failed to add meeting");
        } finally {
            setIsLoding(false);
        }
    };

    const handleUpdateMeeting = async (id, updatedMeeting) => {
        try {
            setIsLoding(true);
            const response = await getApi.put(`/api/meeting/${id}`, updatedMeeting);
            if (response.status === 200) {
                setAction((prev) => !prev); // Trigger re-fetch
                toast.success("Meeting updated successfully");
            }
        } catch (error) {
            console.error("Error updating meeting:", error);
            toast.error("Failed to update meeting");
        } finally {
            setIsLoding(false);
        }
    };

    const handleDeleteMeeting = async (ids) => {
        try {
            setIsLoding(true);
            let response = await deleteManyApi('api/meeting/deleteMany', ids);
            if (response.status === 200) {
                setSelectedValues([]);
                setDeleteMany(false);
                setAction((prev) => !prev); // Trigger re-fetch
                toast.success("Meeting(s) deleted successfully");
            }
        } catch (error) {
            console.error("Error deleting meeting:", error);
            toast.error("Failed to delete meeting");
        } finally {
            setIsLoding(false);
        }
    };

    // const [selectedColumns, setSelectedColumns] = useState([...tableColumns]);
    // const dataColumn = tableColumns?.filter(item => selectedColumns?.find(colum => colum?.Header === item.Header))


    useEffect(() => {
        fetchData();
    }, [action])

    return (
        <div>
            <CommonCheckTable
                title={title}
                isLoding={isLoding}
                columnData={tableColumns ?? []}
                dataColumn={tableColumns ?? []}
                allData={data ?? []}
                tableData={data ?? []}
                searchDisplay={displaySearchData}
                setSearchDisplay={setDisplaySearchData}
                searchedDataOut={searchedData ?? []}
                setSearchedDataOut={setSearchedData}
                tableCustomFields={[]}
                access={permission}
                onClose={onClose}
                onOpen={onOpen}
                selectedValues={selectedValues ?? []}
                setSelectedValues={setSelectedValues}
                setDelete={setDeleteMany}
                AdvanceSearch={
                    <Button variant="outline" colorScheme='brand' leftIcon={<SearchIcon />} mt={{ sm: "5px", md: "0" }} size="sm" onClick={() => setAdvanceSearch(true)}>Advance Search</Button>
                }
                getTagValuesOutSide={getTagValuesOutSide ?? []}
                searchboxOutside={searchboxOutside ?? ''}
                setGetTagValuesOutside={setGetTagValuesOutside}
                setSearchboxOutside={setSearchboxOutside}
                handleSearchType="MeetingSearch"
            />

            <MeetingAdvanceSearch
                advanceSearch={advanceSearch}
                setAdvanceSearch={setAdvanceSearch}
                setSearchedData={setSearchedData}
                setDisplaySearchData={setDisplaySearchData}
                allData={data ?? []}
                setAction={setAction}
                setGetTagValues={setGetTagValuesOutside}
                setSearchbox={setSearchboxOutside}
            />
            <AddMeeting 
                setAction={setAction} 
                isOpen={isOpen} 
                onClose={onClose} 
                onAddMeeting={handleAddMeeting}
                fetchData={fetchData}
            />

            {/* Delete model */}
            <CommonDeleteModel isOpen={deleteMany} onClose={() => setDeleteMany(false)} type='Meetings' handleDeleteData={handleDeleteMeeting} ids={selectedValues} />
        </div>
    )
}

export default Index